import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserStats, UserSettings
from app.models.course import Course
from app.models.unit import Unit
from app.models.skill import Skill
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.vocabulary import VocabularyItem
from app.models.progress import UserSkillProgress, UserLessonProgress

def create_course_with_content(db: Session, name: str, source_lang: str, target_lang: str, icon: str, vocab_list: list):
    course = db.query(Course).filter(Course.source_language == source_lang, Course.target_language == target_lang).first()
    if not course:
        print(f"Creating course: {source_lang} -> {target_lang}...")
        course = Course(
            name=name,
            language=target_lang.lower()[:2],
            source_language=source_lang,
            target_language=target_lang,
            description=f"Learn {target_lang} from {source_lang}.",
            icon=icon,
            is_active=True
        )
        db.add(course)
        db.commit()
        db.refresh(course)

    # Check if units/skills exist
    unit = db.query(Unit).filter(Unit.course_id == course.id).first()
    if not unit:
        unit = Unit(course_id=course.id, title="Unit 1", description="Basics & Fundamentals", order_index=1, is_locked=False)
        db.add(unit)
        db.commit()
        db.refresh(unit)

        skill = Skill(unit_id=unit.id, title="Basics", description="Core vocabulary", order_index=1, is_locked=False)
        db.add(skill)
        db.commit()
        db.refresh(skill)

        for i in range(1, 3):
            lesson = Lesson(skill_id=skill.id, title=f"Lesson {i}", description=f"Basic lesson {i}", order_index=i)
            db.add(lesson)
        db.commit()

    # Seed vocabulary
    existing_vocab = db.query(VocabularyItem).filter(VocabularyItem.course_id == course.id).count()
    if existing_vocab == 0:
        skill = db.query(Skill).join(Unit).filter(Unit.course_id == course.id).first()
        sk_id = skill.id if skill else None
        for src, tgt, cat in vocab_list:
            v = VocabularyItem(
                course_id=course.id,
                skill_id=sk_id,
                source_text=src,
                target_text=tgt,
                category=cat,
                difficulty=1
            )
            db.add(v)
        db.commit()

def seed_additional_courses(db: Session):
    additional_courses = [
        ("Hindi to English", "Hindi", "English", "in_flag.png", [
            ("नमस्ते", "hello", "greetings"),
            ("धन्यवाद", "thank you", "greetings"),
            ("हाँ", "yes", "basics"),
            ("नहीं", "no", "basics"),
            ("पानी", "water", "beverages"),
            ("सेब", "apple", "food"),
            ("बिल्ली", "cat", "animals"),
            ("कुत्ता", "dog", "animals"),
            ("किताब", "book", "objects"),
            ("घर", "house", "places"),
            ("दूध", "milk", "beverages"),
            ("रोटी", "bread", "food"),
            ("माँ", "mother", "family"),
            ("पिता", "father", "family"),
            ("दोस्त", "friend", "people"),
        ]),
        ("French to English", "French", "English", "fr_flag.png", [
            ("bonjour", "hello", "greetings"),
            ("merci", "thank you", "greetings"),
            ("oui", "yes", "basics"),
            ("non", "no", "basics"),
            ("eau", "water", "beverages"),
            ("pomme", "apple", "food"),
            ("chat", "cat", "animals"),
            ("chien", "dog", "animals"),
            ("livre", "book", "objects"),
            ("maison", "house", "places"),
            ("lait", "milk", "beverages"),
            ("pain", "bread", "food"),
            ("mère", "mother", "family"),
            ("père", "father", "family"),
            ("ami", "friend", "people"),
        ]),
        ("German to English", "German", "English", "de_flag.png", [
            ("hallo", "hello", "greetings"),
            ("danke", "thank you", "greetings"),
            ("ja", "yes", "basics"),
            ("nein", "no", "basics"),
            ("wasser", "water", "beverages"),
            ("apfel", "apple", "food"),
            ("katze", "cat", "animals"),
            ("hund", "dog", "animals"),
            ("buch", "book", "objects"),
            ("haus", "house", "places"),
            ("milch", "milk", "beverages"),
            ("brot", "bread", "food"),
            ("mutter", "mother", "family"),
            ("vater", "father", "family"),
            ("freund", "friend", "people"),
        ]),
        ("Italian to English", "Italian", "English", "it_flag.png", [
            ("ciao", "hello", "greetings"),
            ("grazie", "thank you", "greetings"),
            ("sì", "yes", "basics"),
            ("no", "no", "basics"),
            ("acqua", "water", "beverages"),
            ("mela", "apple", "food"),
            ("gatto", "cat", "animals"),
            ("cane", "dog", "animals"),
            ("libro", "book", "objects"),
            ("casa", "house", "places"),
            ("latte", "milk", "beverages"),
            ("pane", "bread", "food"),
            ("madre", "mother", "family"),
            ("padre", "father", "family"),
            ("amico", "friend", "people"),
        ]),
        ("Portuguese to English", "Portuguese", "English", "pt_flag.png", [
            ("olá", "hello", "greetings"),
            ("obrigado", "thank you", "greetings"),
            ("sim", "yes", "basics"),
            ("não", "no", "basics"),
            ("água", "water", "beverages"),
            ("maçã", "apple", "food"),
            ("gato", "cat", "animals"),
            ("cão", "dog", "animals"),
            ("livro", "book", "objects"),
            ("casa", "house", "places"),
            ("leite", "milk", "beverages"),
            ("pão", "bread", "food"),
            ("mãe", "mother", "family"),
            ("pai", "father", "family"),
            ("amigo", "friend", "people"),
        ]),
        ("Japanese to English", "Japanese", "English", "jp_flag.png", [
            ("こんにちは", "hello", "greetings"),
            ("ありがとう", "thank you", "greetings"),
            ("はい", "yes", "basics"),
            ("いいえ", "no", "basics"),
            ("みず", "water", "beverages"),
            ("りんご", "apple", "food"),
            ("ねこ", "cat", "animals"),
            ("いぬ", "dog", "animals"),
            ("ほん", "book", "objects"),
            ("いえ", "house", "places"),
            ("ぎゅうにゅう", "milk", "beverages"),
            ("パン", "bread", "food"),
            ("おかあさん", "mother", "family"),
            ("おとうさん", "father", "family"),
            ("ともだち", "friend", "people"),
        ]),
        ("English to Spanish", "English", "Spanish", "es_flag.png", [
            ("hello", "hola", "greetings"),
            ("thank you", "gracias", "greetings"),
            ("yes", "sí", "basics"),
            ("no", "no", "basics"),
            ("water", "agua", "beverages"),
            ("apple", "manzana", "food"),
            ("cat", "gato", "animals"),
            ("dog", "perro", "animals"),
            ("book", "libro", "objects"),
            ("house", "casa", "places"),
            ("milk", "leche", "beverages"),
            ("bread", "pan", "food"),
            ("mother", "madre", "family"),
            ("father", "padre", "family"),
            ("friend", "amigo", "people"),
        ]),
        ("English to French", "English", "French", "fr_flag.png", [
            ("hello", "bonjour", "greetings"),
            ("thank you", "merci", "greetings"),
            ("yes", "oui", "basics"),
            ("no", "non", "basics"),
            ("water", "eau", "beverages"),
            ("apple", "pomme", "food"),
            ("cat", "chat", "animals"),
            ("dog", "chien", "animals"),
            ("book", "livre", "objects"),
            ("house", "maison", "places"),
            ("milk", "lait", "beverages"),
            ("bread", "pain", "food"),
            ("mother", "mère", "family"),
            ("father", "père", "family"),
            ("friend", "ami", "people"),
        ]),
        ("English to German", "English", "German", "de_flag.png", [
            ("hello", "hallo", "greetings"),
            ("thank you", "danke", "greetings"),
            ("yes", "ja", "basics"),
            ("no", "nein", "basics"),
            ("water", "wasser", "beverages"),
            ("apple", "apfel", "food"),
            ("cat", "katze", "animals"),
            ("dog", "hund", "animals"),
            ("book", "buch", "objects"),
            ("house", "haus", "places"),
            ("milk", "milch", "beverages"),
            ("bread", "brot", "food"),
            ("mother", "mutter", "family"),
            ("father", "vater", "family"),
            ("friend", "freund", "people"),
        ]),
    ]

    for name, src, tgt, icon, vlist in additional_courses:
        create_course_with_content(db, name, src, tgt, icon, vlist)

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
                description="Learn basic English vocabulary and grammar from Spanish.",
                icon="us_flag.png",
                is_active=True
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            
            # Create settings for demo_learner with onboarding complete
            demo_settings = UserSettings(
                user_id=demo_user.id,
                course_id=course.id,
                course_language="en",
                sound_enabled=True,
                notifications_enabled=True,
                proficiency_level="new",
                onboarding_completed=True,
                placement_completed=False,
                starting_level="beginner",
            )
            db.add(demo_settings)
            db.commit()
            
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
            course = db.query(Course).first()
            if course:
                if not getattr(course, "source_language", None):
                    course.source_language = "Spanish"
                if not getattr(course, "target_language", None):
                    course.target_language = "English"
                db.commit()

            skills = db.query(Skill).all()
            if course and skills:
                seed_vocabulary(db, course.id, skills)

        # Seed 6 additional language courses idempotently
        seed_additional_courses(db)

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
