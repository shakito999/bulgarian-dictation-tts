# Българска Диктовка · Bulgarian Dictation

> A focused, browser-based TTS tool for dictation, writing practice, and careful listening.

**Българска Диктовка** reads pasted text aloud in short, adjustable chunks and announces punctuation so you can write along at your own pace.

## 🇧🇬 Български

### Какво прави

- Чете поставен текст на глас чрез Google TTS.
- Разделя текста на избран брой думи наведнъж — от 1 до 10.
- Обявява пунктуацията: „запетая“, „точка“, „удивителна“, „въпросителна“ и „нов ред“.
- Позволява настройка на скоростта на говорене.
- Има отделна настройка за скоростта на писане, за да се изчислява приблизителната продължителност.
- Настройва паузите след запетая, точка и нов ред.
- Поддържа пауза, продължаване, спиране и тест на звука.
- Позволява избор между Google TTS и наличните гласове на браузъра.

### Стартиране

1. Изтеглете или клонирайте repository-то.
2. Отворете `index.html` в модерен браузър.
3. Поставете текста си.
4. Настройте гласа, скоростта, броя думи на част и паузите.
5. Натиснете **Започни**.

Не е необходим build процес или инсталация на зависимости.

### Важно

Приложението използва интернет връзка за Google TTS. Текстът, който се чете чрез Google TTS, се изпраща към Google Translate TTS endpoint. Като алтернатива може да бъде избран локален глас, предоставен от браузъра и операционната система.

## 🇬🇧 English

### What it does

- Reads pasted text aloud using Google TTS.
- Splits text into an adjustable number of words per chunk — from 1 to 10.
- Announces punctuation: comma, period, exclamation mark, question mark, and new paragraph.
- Provides an adjustable speaking speed.
- Includes a separate writing-speed setting for an estimated total duration.
- Lets you tune pauses after commas, periods, and new lines.
- Supports pause, resume, stop, and sound-test controls.
- Lets you choose between Google TTS and voices available in the browser.

### Getting started

1. Download or clone the repository.
2. Open `index.html` in a modern browser.
3. Paste your text.
4. Adjust the voice, speed, words per chunk, and pauses.
5. Press **Започни / Start**.

No build step or dependency installation is required.

### Important

The app needs an internet connection for Google TTS. Text read through Google TTS is sent to the Google Translate TTS endpoint. As an alternative, you can select a local browser voice provided by your browser and operating system.

## Tech stack

- Vanilla HTML, CSS, and JavaScript
- Web Speech API for browser voices
- Google Translate TTS endpoint as the default voice
- No framework, bundler, or backend required

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Main polished application — open this file to run it |
| `app.js` | Earlier React prototype kept for reference |

## License

This project is provided as-is for personal and educational use. Add your preferred license before redistributing it commercially.
