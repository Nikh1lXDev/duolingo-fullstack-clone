import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserStats
from app.models.course import Course
from app.models.unit import Unit
from app.models.skill import Skill
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.vocabulary import VocabularyItem
from app.models.progress import UserSkillProgress, UserLessonProgress

def seed_vocabulary(db: Session, course_id: int, skills: list):
    existing_count = db.query(VocabularyItem).filter(VocabularyItem.course_id == course_id).count()
    if existing_count > 0:
        return

    print("Seeding course vocabulary items...")
    skill_map = {s.title: s.id for s in skills}

    vocab_data = [
        # Basics
        ("manzana", "apple", "food", 1, "Basics"),
        ("agua", "water", "beverages", 1, "Basics"),
        ("sí", "yes", "general", 1, "Basics"),
        ("no", "no", "general", 1, "Basics"),
        ("libro", "book", "objects", 1, "Basics"),

        # Greetings
        ("hola", "hello", "greetings", 1, "Greetings"),
        ("adiós", "goodbye", "greetings", 1, "Greetings"),
        ("gracias", "thank you", "greetings", 1, "Greetings"),
        ("por favor", "please", "greetings", 1, "Greetings"),
        ("buenos días", "good morning", "greetings", 1, "Greetings"),

        # Food
        ("pan", "bread", "food", 2, "Food"),
        ("leche", "milk", "beverages", 2, "Food"),
        ("queso", "cheese", "food", 2, "Food"),
        ("arroz", "rice", "food", 2, "Food"),
        ("fruta", "fruit", "food", 2, "Food"),

        # Family
        ("madre", "mother", "family", 2, "Family"),
        ("padre", "father", "family", 2, "Family"),
        ("hermano", "brother", "family", 2, "Family"),
        ("hermana", "sister", "family", 2, "Family"),
        ("hijo", "son", "family", 2, "Family"),

        # Animals
        ("gato", "cat", "animals", 3, "Animals"),
        ("perro", "dog", "animals", 3, "Animals"),
        ("pájaro", "bird", "animals", 3, "Animals"),
        ("caballo", "horse", "animals", 3, "Animals"),
        ("pez", "fish", "animals", 3, "Animals"),

        # Everyday Life
        ("casa", "house", "places", 3, "Everyday Life"),
        ("escuela", "school", "places", 3, "Everyday Life"),
        ("estudiante", "student", "people", 3, "Everyday Life"),
        ("trabajo", "work", "activities", 3, "Everyday Life"),
        ("amigo", "friend", "people", 3, "Everyday Life"),
    ]

    for src, tgt, cat, diff, skill_name in vocab_data:
        sk_id = skill_map.get(skill_name)
        v = VocabularyItem(
            course_id=course_id,
            skill_id=sk_id,
            source_text=src,
            target_text=tgt,
            category=cat,
            difficulty=diff
        )
        db.add(v)
    db.commit()

def seed_data():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        
        demo_user = db.query(User).filter(User.username == "demo_learner").first()
        is_first_run = demo_user is None
        
        if is_first_run:
            print("Seeding demo learner and course data...")

            # 1. User & Stats
            demo_user = User(
                username="demo_learner",
                email="demo@example.com",
                display_name="Demo Learner",
                avatar="https://ui-avatars.com/api/?name=Demo+Learner"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            
            user_stats = UserStats(
                user_id=demo_user.id,
                xp=0,
                gems=1000,
                hearts=5,
                streak=0,
                longest_streak=0,
                daily_xp_goal=20,
                daily_xp_progress=0,
                daily_xp_date=None,
                lessons_completed=0
            )
            db.add(user_stats)
            
            # 2. Course
            course = Course(
                name="English for Beginners",
                language="en",
                source_language="Spanish",
                target_language="English",
                description="Learn basic English vocabulary and grammar.",
                icon="us_flag.png",
                is_active=True
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            
            # 3. Units
            unit1 = Unit(course_id=course.id, title="Unit 1", description="Basics & Greetings", order_index=1, is_locked=False)
            unit2 = Unit(course_id=course.id, title="Unit 2", description="Food & Family", order_index=2, is_locked=True)
            unit3 = Unit(course_id=course.id, title="Unit 3", description="Animals & Everyday Life", order_index=3, is_locked=True)
            db.add_all([unit1, unit2, unit3])
            db.commit()
            
            # 4. Skills (2 per unit)
            skills_data = [
                (unit1.id, "Basics", "Basic vocabulary", 1),
                (unit1.id, "Greetings", "Saying hello", 2),
                (unit2.id, "Food", "Eating and drinking", 3),
                (unit2.id, "Family", "Family members", 4),
                (unit3.id, "Animals", "Common animals", 5),
                (unit3.id, "Everyday Life", "Daily routines", 6),
            ]
            skills = []
            for uid, title, desc, idx in skills_data:
                s = Skill(unit_id=uid, title=title, description=desc, order_index=idx, is_locked=(idx > 1))
                db.add(s)
                skills.append(s)
            db.commit()

            # Seed vocabulary
            seed_vocabulary(db, course.id, skills)
            
            # 5. Lessons (2 per skill)
            lessons = []
            l_idx = 1
            for s in skills:
                for i in range(1, 3):
                    l = Lesson(skill_id=s.id, title=f"Lesson {i}", description=f"{s.title} lesson {i}", order_index=l_idx)
                    db.add(l)
                    lessons.append(l)
                    l_idx += 1
            db.commit()
            
            # 6. Seed Baseline Exercises
            exercise_pools = {
                "multiple_choice": [
                    {"prompt": "What is 'manzana' in English?", "correct_answer": "apple", "options": json.dumps(["apple", "cat", "dog"]), "direction": "source_to_target"},
                    {"prompt": "Which word means 'hello'?", "correct_answer": "hola", "options": json.dumps(["hola", "gracias", "adiós"]), "direction": "target_to_source"},
                ],
                "translate": [
                    {"prompt": "hola", "correct_answer": "hello", "translation": "Translate to English", "direction": "source_to_target"},
                    {"prompt": "water", "correct_answer": "agua", "translation": "Translate to Spanish", "direction": "target_to_source"},
                ],
                "word_bank": [
                    {"prompt": "Translate: 'manzana'", "correct_answer": "apple", "options": json.dumps(["apple", "cat", "water", "book"]), "direction": "source_to_target"},
                ],
                "match_pairs": [
                    {
                        "prompt": "Match the words",
                        "correct_answer": json.dumps({"hello": "hola", "apple": "manzana", "cat": "gato", "dog": "perro"}),
                        "options": json.dumps(["hello", "hola", "apple", "manzana", "cat", "gato", "dog", "perro"]),
                        "direction": "source_to_target"
                    }
                ],
                "fill_blank": [
                    {"prompt": "___ means 'apple'.", "correct_answer": "manzana", "options": json.dumps(["manzana", "gato", "perro"]), "direction": "target_to_source"}
                ],
                "type_answer": [
                    {"prompt": "Type the English word for 'manzana'", "correct_answer": "apple", "direction": "source_to_target"}
                ]
            }
            
            e_types = ["multiple_choice", "translate", "word_bank", "match_pairs", "fill_blank", "type_answer"]
            e_idx = 1
            for l in lessons:
                for i in range(6):
                    etype = e_types[i % len(e_types)]
                    pool = exercise_pools[etype]
                    chosen = pool[i % len(pool)]
                    
                    ex = Exercise(
                        lesson_id=l.id,
                        type=etype,
                        prompt=chosen.get("prompt"),
                        correct_answer=chosen.get("correct_answer"),
                        options=chosen.get("options"),
                        translation=chosen.get("translation"),
                        direction=chosen.get("direction", "source_to_target"),
                        order_index=i + 1
                    )
                    db.add(ex)
                    e_idx += 1
            db.commit()
            
            # 7. Progression
            sp1 = UserSkillProgress(user_id=demo_user.id, skill_id=skills[0].id, completed=True, progress=100, crowns=1, lessons_completed=2)
            db.add(sp1)
            db.add(UserLessonProgress(user_id=demo_user.id, lesson_id=lessons[0].id, completed=True, progress=100, attempts=1, score=100))
            db.add(UserLessonProgress(user_id=demo_user.id, lesson_id=lessons[1].id, completed=True, progress=100, attempts=1, score=100))
            
            sp2 = UserSkillProgress(user_id=demo_user.id, skill_id=skills[1].id, completed=False, progress=50, crowns=0, lessons_completed=1)
            db.add(sp2)
            db.add(UserLessonProgress(user_id=demo_user.id, lesson_id=lessons[2].id, completed=True, progress=100, attempts=1, score=90))
            db.add(UserLessonProgress(user_id=demo_user.id, lesson_id=lessons[3].id, completed=False, progress=0, attempts=0, score=0))
            
            sp3 = UserSkillProgress(user_id=demo_user.id, skill_id=skills[2].id, completed=False, progress=0, crowns=0, lessons_completed=0)
            db.add(sp3)
            
            db.commit()
            print("Demo data seeding complete.")

        else:
            # Ensure course has language fields updated if missing
            course = db.query(Course).first()
            if course:
                if not getattr(course, "source_language", None):
                    course.source_language = "Spanish"
                if not getattr(course, "target_language", None):
                    course.target_language = "English"
                db.commit()

            # Ensure vocabulary is seeded even if course already exists
            skills = db.query(Skill).all()
            if course and skills:
                seed_vocabulary(db, course.id, skills)

        print("Seeding leaderboard mock users...")
        mock_users = [
            {"username": "alex", "email": "alex@example.com", "display_name": "Alex", "xp": 1250, "streak": 14},
            {"username": "maya", "email": "maya@example.com", "display_name": "Maya", "xp": 980, "streak": 7},
            {"username": "leo", "email": "leo@example.com", "display_name": "Leo", "xp": 420, "streak": 3},
            {"username": "sofia", "email": "sofia@example.com", "display_name": "Sofia", "xp": 2150, "streak": 30},
        ]
        
        for mock in mock_users:
            u = db.query(User).filter(User.username == mock["username"]).first()
            if not u:
                u = User(
                    username=mock["username"],
                    email=mock["email"],
                    display_name=mock["display_name"],
                    avatar=f"https://ui-avatars.com/api/?name={mock['display_name']}"
                )
                db.add(u)
                db.commit()
                db.refresh(u)
                
                stats = UserStats(
                    user_id=u.id,
                    xp=mock["xp"],
                    gems=500,
                    hearts=5,
                    streak=mock["streak"],
                    longest_streak=mock["streak"],
                    daily_xp_goal=20,
                    daily_xp_progress=0,
                    lessons_completed=mock["xp"] // 15
                )
                db.add(stats)
                db.commit()
                
        print("Leaderboard mock users verified.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
