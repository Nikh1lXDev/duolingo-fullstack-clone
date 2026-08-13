import pytest
import json
from app.models.course import Course
from app.models.skill import Skill
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.vocabulary import VocabularyItem
from app.models.progress import UserSkillProgress
from app.services.exercise_generator import generate_exercises_for_lesson, get_lesson_vocabulary

def test_course_language_configuration(db_session):
    course = db_session.query(Course).first()
    assert course is not None
    assert hasattr(course, "source_language")
    assert hasattr(course, "target_language")
    assert course.source_language == "Spanish"
    assert course.target_language == "English"

def test_vocabulary_model_crud(db_session):
    course = db_session.query(Course).first()
    item = VocabularyItem(
        course_id=course.id,
        source_text="test_fuente",
        target_text="test_target",
        category="test",
        difficulty=1
    )
    db_session.add(item)
    db_session.commit()
    db_session.refresh(item)

    fetched = db_session.query(VocabularyItem).filter(VocabularyItem.id == item.id).first()
    assert fetched is not None
    assert fetched.source_text == "test_fuente"
    assert fetched.target_text == "test_target"

    # Cleanup test item
    db_session.delete(fetched)
    db_session.commit()

def test_dynamic_exercise_generation_all_types(db_session):
    lesson = db_session.query(Lesson).first()
    exercises = generate_exercises_for_lesson(db_session, lesson, seed=42)

    assert len(exercises) == 6
    types = [ex.type for ex in exercises]
    assert "multiple_choice" in types
    assert "translate" in types
    assert "word_bank" in types
    assert "match_pairs" in types
    assert "fill_blank" in types
    assert "type_answer" in types

def test_multiple_choice_direction_and_distractors(db_session):
    lesson = db_session.query(Lesson).first()
    exercises = generate_exercises_for_lesson(db_session, lesson, seed=10)
    
    mc_ex = [e for e in exercises if e.type == "multiple_choice"][0]
    assert mc_ex.prompt is not None
    assert mc_ex.correct_answer is not None
    
    options = json.loads(mc_ex.options)
    assert isinstance(options, list)
    assert len(options) >= 2
    assert mc_ex.correct_answer in options
    assert mc_ex.direction in ["source_to_target", "target_to_source"]

def test_translate_exercise_direction(db_session):
    lesson = db_session.query(Lesson).first()
    exercises = generate_exercises_for_lesson(db_session, lesson, seed=10)
    
    trans_ex = [e for e in exercises if e.type == "translate"][0]
    assert trans_ex.prompt is not None
    assert trans_ex.correct_answer is not None
    assert trans_ex.direction in ["source_to_target", "target_to_source"]

def test_word_bank_exercise_chips(db_session):
    lesson = db_session.query(Lesson).first()
    exercises = generate_exercises_for_lesson(db_session, lesson, seed=10)
    
    wb_ex = [e for e in exercises if e.type == "word_bank"][0]
    options = json.loads(wb_ex.options)
    assert isinstance(options, list)
    # The words of the correct answer should be in options
    for word in wb_ex.correct_answer.split():
        assert word in options

def test_match_pairs_exercise_structure(db_session):
    lesson = db_session.query(Lesson).first()
    exercises = generate_exercises_for_lesson(db_session, lesson, seed=10)
    
    mp_ex = [e for e in exercises if e.type == "match_pairs"][0]
    pairs = json.loads(mp_ex.correct_answer)
    all_words = json.loads(mp_ex.options)
    
    assert isinstance(pairs, dict)
    assert isinstance(all_words, list)
    for k, v in pairs.items():
        assert k in all_words
        assert v in all_words

def test_fill_blank_exercise_options(db_session):
    lesson = db_session.query(Lesson).first()
    exercises = generate_exercises_for_lesson(db_session, lesson, seed=10)
    
    fb_ex = [e for e in exercises if e.type == "fill_blank"][0]
    options = json.loads(fb_ex.options)
    assert fb_ex.correct_answer in options
    assert "___" in fb_ex.prompt

def test_type_answer_exercise_prompt(db_session):
    lesson = db_session.query(Lesson).first()
    exercises = generate_exercises_for_lesson(db_session, lesson, seed=10)
    
    ta_ex = [e for e in exercises if e.type == "type_answer"][0]
    assert ta_ex.prompt is not None
    assert ta_ex.correct_answer is not None

def test_progress_aware_vocabulary_selection(db_session):
    lesson = db_session.query(Lesson).filter(Lesson.order_index == 3).first()
    if not lesson:
        lesson = db_session.query(Lesson).first()
        
    vocab_items = get_lesson_vocabulary(db_session, lesson, user_id=1)
    assert len(vocab_items) > 0

def test_deterministic_randomization(db_session):
    lesson = db_session.query(Lesson).first()
    run1 = generate_exercises_for_lesson(db_session, lesson, seed=99)
    run2 = generate_exercises_for_lesson(db_session, lesson, seed=99)

    for e1, e2 in zip(run1, run2):
        assert e1.prompt == e2.prompt
        assert e1.correct_answer == e2.correct_answer
        assert e1.options == e2.options

from fastapi.testclient import TestClient
from app.main import app

def test_api_lesson_endpoint_returns_dynamic_exercises():
    test_client = TestClient(app)
    response = test_client.get("/api/lessons/1")
    assert response.status_code == 200
    data = response.json()
    assert "exercises" in data
    assert len(data["exercises"]) == 6
    for ex in data["exercises"]:
        assert "direction" in ex

import uuid

def test_me_next_lesson_endpoint_returns_dynamic_exercises():
    test_client = TestClient(app)
    u_name = f"dyn_user_{uuid.uuid4().hex[:6]}"
    reg_res = test_client.post("/api/auth/register", json={"username": u_name, "email": f"{u_name}@example.com", "password": "password123"})
    assert reg_res.status_code in (200, 201)
    response = test_client.get("/api/users/me/skills/1/next-lesson")
    assert response.status_code == 200
    data = response.json()
    assert "exercises" in data
    assert len(data["exercises"]) == 6

