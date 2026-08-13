import json
import random
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.vocabulary import VocabularyItem
from app.models.progress import UserSkillProgress, UserLessonProgress
from app.models.course import Course

def get_lesson_vocabulary(db: Session, lesson: Lesson, user_id: Optional[int] = None) -> List[VocabularyItem]:
    """
    Progress-aware vocabulary selection strategy:
    - Skill Vocabulary: Items belonging directly to lesson's skill.
    - Review Vocabulary: Includes items from previously completed skills for spaced reinforcement.
    """
    skill = lesson.skill
    course_id = skill.unit.course_id if (skill and skill.unit) else None
    
    # 1. Primary skill vocabulary
    skill_vocab = db.query(VocabularyItem).filter(VocabularyItem.skill_id == skill.id).all() if skill else []
    
    # If no skill-specific vocabulary exists, fallback to course vocabulary
    if not skill_vocab and course_id:
        skill_vocab = db.query(VocabularyItem).filter(VocabularyItem.course_id == course_id).all()
        
    if not skill_vocab:
        # Fallback default items if DB has no vocabulary seeded yet
        return []
        
    # 2. Spaced review vocabulary from completed skills
    review_vocab = []
    if user_id and course_id:
        completed_skills = db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.completed == True,
            UserSkillProgress.skill_id != skill.id
        ).all()
        completed_skill_ids = [sp.skill_id for sp in completed_skills]
        if completed_skill_ids:
            review_vocab = db.query(VocabularyItem).filter(
                VocabularyItem.skill_id.in_(completed_skill_ids)
            ).all()

    # Blend skill vocabulary with review vocabulary (up to 20% review items)
    combined = list(skill_vocab)
    if review_vocab:
        review_sample = random.sample(review_vocab, min(len(review_vocab), max(1, len(skill_vocab) // 3)))
        for r_item in review_sample:
            if r_item not in combined:
                combined.append(r_item)

    return combined

def get_course_all_vocabulary(db: Session, course_id: int) -> List[VocabularyItem]:
    return db.query(VocabularyItem).filter(VocabularyItem.course_id == course_id).all()

def generate_exercises_for_lesson(
    db: Session, 
    lesson: Lesson, 
    user_id: Optional[int] = None, 
    seed: Optional[int] = None
) -> List[Exercise]:
    """
    Dynamically generates or maps exercises for a lesson based on course language configuration,
    vocabulary data model, exercise types, and exercise directions.
    """
    if seed is not None:
        random.seed(seed)

    skill = lesson.skill
    course = skill.unit.course if (skill and skill.unit) else None
    
    source_lang = getattr(course, "source_language", "Spanish") if course else "Spanish"
    target_lang = getattr(course, "target_language", "English") if course else "English"
    course_id = course.id if course else 1

    vocab_list = get_lesson_vocabulary(db, lesson, user_id=user_id)
    all_course_vocab = get_course_all_vocabulary(db, course_id)
    
    if not all_course_vocab:
        all_course_vocab = vocab_list

    # Fallback if no vocabulary is available at all
    if not vocab_list:
        return lesson.exercises

    generated_exercises = []
    
    # We generate 6 standard exercise types per lesson dynamically
    e_types = ["multiple_choice", "translate", "word_bank", "match_pairs", "fill_blank", "type_answer"]
    
    for idx, etype in enumerate(e_types, start=1):
        item = vocab_list[(idx - 1) % len(vocab_list)]
        direction = "source_to_target" if (idx % 2 != 0) else "target_to_source"

        if etype == "multiple_choice":
            if direction == "source_to_target":
                prompt = f"What is '{item.source_text}' in {target_lang}?"
                correct = item.target_text
                # Distractors in target language
                distractor_pool = [v.target_text for v in all_course_vocab if v.target_text != correct]
                distractor_pool = list(set(distractor_pool))
                distractors = random.sample(distractor_pool, min(2, len(distractor_pool))) if distractor_pool else ["water", "house"]
                opts = [correct] + distractors
                random.shuffle(opts)
            else:
                prompt = f"Which word means '{item.target_text}'?"
                correct = item.source_text
                # Distractors in source language
                distractor_pool = [v.source_text for v in all_course_vocab if v.source_text != correct]
                distractor_pool = list(set(distractor_pool))
                distractors = random.sample(distractor_pool, min(2, len(distractor_pool))) if distractor_pool else ["gato", "perro"]
                opts = [correct] + distractors
                random.shuffle(opts)

            ex = Exercise(
                id=1000 + idx,
                lesson_id=lesson.id,
                type="multiple_choice",
                prompt=prompt,
                correct_answer=correct,
                options=json.dumps(opts),
                direction=direction,
                order_index=idx,
                xp_reward=2
            )

        elif etype == "translate":
            if direction == "source_to_target":
                prompt = item.source_text
                correct = item.target_text
                trans = f"Translate to {target_lang}"
            else:
                prompt = item.target_text
                correct = item.source_text
                trans = f"Translate to {source_lang}"

            ex = Exercise(
                id=1000 + idx,
                lesson_id=lesson.id,
                type="translate",
                prompt=prompt,
                correct_answer=correct,
                translation=trans,
                direction=direction,
                order_index=idx,
                xp_reward=2
            )

        elif etype == "word_bank":
            if direction == "source_to_target":
                prompt = f"Translate: '{item.source_text}'"
                correct = item.target_text
                words = correct.split(" ")
                distractor_pool = []
                for v in all_course_vocab:
                    if v.target_text != item.target_text:
                        distractor_pool.extend(v.target_text.split(" "))
                distractor_pool = list(set([w for w in distractor_pool if w not in words]))
                distractors = random.sample(distractor_pool, min(3, len(distractor_pool))) if distractor_pool else ["the", "a", "is"]
                opts = words + distractors
                random.shuffle(opts)
            else:
                prompt = f"Translate: '{item.target_text}'"
                correct = item.source_text
                words = correct.split(" ")
                distractor_pool = []
                for v in all_course_vocab:
                    if v.source_text != item.source_text:
                        distractor_pool.extend(v.source_text.split(" "))
                distractor_pool = list(set([w for w in distractor_pool if w not in words]))
                distractors = random.sample(distractor_pool, min(3, len(distractor_pool))) if distractor_pool else ["el", "la", "un"]
                opts = words + distractors
                random.shuffle(opts)

            ex = Exercise(
                id=1000 + idx,
                lesson_id=lesson.id,
                type="word_bank",
                prompt=prompt,
                correct_answer=correct,
                options=json.dumps(opts),
                direction=direction,
                order_index=idx,
                xp_reward=2
            )

        elif etype == "match_pairs":
            sample_items = random.sample(all_course_vocab, min(4, len(all_course_vocab))) if len(all_course_vocab) >= 4 else all_course_vocab
            if not sample_items:
                sample_items = [item]
            
            if direction == "source_to_target":
                pairs = {v.target_text: v.source_text for v in sample_items}
                all_words = list(pairs.keys()) + list(pairs.values())
            else:
                pairs = {v.source_text: v.target_text for v in sample_items}
                all_words = list(pairs.keys()) + list(pairs.values())
            
            random.shuffle(all_words)

            ex = Exercise(
                id=1000 + idx,
                lesson_id=lesson.id,
                type="match_pairs",
                prompt="Match the pairs",
                correct_answer=json.dumps(pairs),
                options=json.dumps(all_words),
                direction=direction,
                order_index=idx,
                xp_reward=2
            )

        elif etype == "fill_blank":
            if direction == "source_to_target":
                prompt = f"___ means '{item.target_text}'."
                correct = item.source_text
                distractor_pool = [v.source_text for v in all_course_vocab if v.source_text != correct]
                distractor_pool = list(set(distractor_pool))
                distractors = random.sample(distractor_pool, min(2, len(distractor_pool))) if distractor_pool else ["gato", "perro"]
                opts = [correct] + distractors
                random.shuffle(opts)
            else:
                prompt = f"___ means '{item.source_text}'."
                correct = item.target_text
                distractor_pool = [v.target_text for v in all_course_vocab if v.target_text != correct]
                distractor_pool = list(set(distractor_pool))
                distractors = random.sample(distractor_pool, min(2, len(distractor_pool))) if distractor_pool else ["cat", "dog"]
                opts = [correct] + distractors
                random.shuffle(opts)

            ex = Exercise(
                id=1000 + idx,
                lesson_id=lesson.id,
                type="fill_blank",
                prompt=prompt,
                correct_answer=correct,
                options=json.dumps(opts),
                direction=direction,
                order_index=idx,
                xp_reward=2
            )

        elif etype == "type_answer":
            if direction == "source_to_target":
                prompt = f"Type the {target_lang} word for '{item.source_text}'"
                correct = item.target_text
            else:
                prompt = f"Type the {source_lang} word for '{item.target_text}'"
                correct = item.source_text

            ex = Exercise(
                id=1000 + idx,
                lesson_id=lesson.id,
                type="type_answer",
                prompt=prompt,
                correct_answer=correct,
                direction=direction,
                order_index=idx,
                xp_reward=2
            )

        generated_exercises.append(ex)

    return generated_exercises
