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
from app.models.progress import UserSkillProgress, UserLessonProgress

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
            
            # 6. Exercises (6 per lesson, one of each type)
            exercise_pools = {
                "multiple_choice": [
                    {"prompt": "Which of these is 'Apple'?", "correct_answer": "Manzana", "options": json.dumps(["Manzana", "Gato", "Perro"])},
                    {"prompt": "Which of these is 'Cat'?", "correct_answer": "Gato", "options": json.dumps(["Manzana", "Gato", "Perro"])},
                    {"prompt": "Which of these is 'Dog'?", "correct_answer": "Perro", "options": json.dumps(["Manzana", "Gato", "Perro"])},
                ],
                "translate": [
                    {"prompt": "Hola", "correct_answer": "Hello", "translation": "Greeting"},
                    {"prompt": "Adiós", "correct_answer": "Goodbye", "translation": "Farewell"},
                    {"prompt": "Gracias", "correct_answer": "Thank you", "translation": "Expression of gratitude"},
                ],
                "word_bank": [
                    {"prompt": "Translate: 'I am a student'", "correct_answer": "Soy un estudiante", "options": json.dumps(["Soy", "un", "estudiante", "una", "manzana"])},
                    {"prompt": "Translate: 'The cat eats'", "correct_answer": "El gato come", "options": json.dumps(["El", "gato", "come", "perro", "la"])},
                    {"prompt": "Translate: 'Good morning'", "correct_answer": "Buenos días", "options": json.dumps(["Buenos", "días", "tardes", "Hola"])},
                ],
                "match_pairs": [
                    {
                        "prompt": "Match the words",
                        "correct_answer": json.dumps({"Hello": "Hola", "Apple": "Manzana", "Cat": "Gato", "Dog": "Perro"}),
                        "options": json.dumps(["Hello", "Hola", "Apple", "Manzana", "Cat", "Gato", "Dog", "Perro"])
                    },
                    {
                        "prompt": "Match the greetings",
                        "correct_answer": json.dumps({"Good morning": "Buenos días", "Good night": "Buenas noches", "Goodbye": "Adiós", "Please": "Por favor"}),
                        "options": json.dumps(["Good morning", "Buenos días", "Good night", "Buenas noches", "Goodbye", "Adiós", "Please", "Por favor"])
                    }
                ],
                "fill_blank": [
                    {"prompt": "Yo ___ un estudiante.", "correct_answer": "soy", "options": json.dumps(["soy", "eres", "es"])},
                    {"prompt": "El perro ___ agua.", "correct_answer": "bebe", "options": json.dumps(["bebe", "comes", "soy"])},
                    {"prompt": "___ noches.", "correct_answer": "Buenas", "options": json.dumps(["Buenas", "Buenos", "Hola"])},
                ],
                "type_answer": [
                    {"prompt": "How do you say 'Hello'?", "correct_answer": "Hola"},
                    {"prompt": "Type the translation for 'Dog'", "correct_answer": "Perro"},
                    {"prompt": "How do you say 'Thank you'?", "correct_answer": "Gracias"},
                ]
            }
            
            e_types = ["multiple_choice", "translate", "word_bank", "match_pairs", "fill_blank", "type_answer"]
            e_idx = 1
            for l in lessons:
                for i in range(6):  # 6 exercises per lesson to cover all types
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
                        order_index=i + 1
                    )
                    db.add(ex)
                    e_idx += 1
            db.commit()
            
            # 7. Progression (1 completed, 1 in-progress, 1 unlocked, rest locked)
            # Skill 1: Completed
            sp1 = UserSkillProgress(user_id=demo_user.id, skill_id=skills[0].id, completed=True, progress=100, crowns=1, lessons_completed=2)
            db.add(sp1)
            # Lessons for Skill 1
            db.add(UserLessonProgress(user_id=demo_user.id, lesson_id=lessons[0].id, completed=True, progress=100, attempts=1, score=100))
            db.add(UserLessonProgress(user_id=demo_user.id, lesson_id=lessons[1].id, completed=True, progress=100, attempts=1, score=100))
            
            # Skill 2: In-Progress
            sp2 = UserSkillProgress(user_id=demo_user.id, skill_id=skills[1].id, completed=False, progress=50, crowns=0, lessons_completed=1)
            db.add(sp2)
            # Lessons for Skill 2
            db.add(UserLessonProgress(user_id=demo_user.id, lesson_id=lessons[2].id, completed=True, progress=100, attempts=1, score=90))
            db.add(UserLessonProgress(user_id=demo_user.id, lesson_id=lessons[3].id, completed=False, progress=0, attempts=0, score=0))
            
            # Skill 3 is unlocked but no progress record needed yet (or we can create one with 0)
            sp3 = UserSkillProgress(user_id=demo_user.id, skill_id=skills[2].id, completed=False, progress=0, crowns=0, lessons_completed=0)
            db.add(sp3)
            
            db.commit()
            print("Demo data seeding complete.")

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
