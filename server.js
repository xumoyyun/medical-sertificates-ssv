// server.js
const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// 1) Отдаём статику из public и папки certificates
app.use(express.static(path.join(__dirname, 'public')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// 2) Корень редиректим на форму
app.get('/', (req, res) => {
  res.redirect('/form/sick-leave');
});

// 3) Форма с необязательным параметром code
app.get('/form/sick-leave/:code?', (req, res) => {
  const code    = req.params.code || '';
  const VALID   = '2187';
  const isValid = code === VALID;
  const pdfPath = path.join(__dirname, 'certificates', `${code}.pdf`);
  const exists  = isValid && fs.existsSync(pdfPath);

  // если код верный и файл есть — редиректим на него
  if (exists) {
    return res.redirect(`/certificates/${code}.pdf`);
  }

  // иначе рисуем форму
  res.send(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Медицинское заключение</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen p-4">
  <div class="max-w-md w-full">
    <!-- Header -->
    <div class="flex items-center mb-8">
      <img src="/assets/logo.png" alt="Логотип" class="w-[120px] h-[120px] mr-4"/>
      <div>
        <p class="text-lg font-medium">Министерство здравоохранения</p>
        <p class="text-lg font-medium">Республики Узбекистан</p>
      </div>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-lg shadow p-8">
      <form
        onsubmit="location.href='/form/sick-leave/' + document.getElementById('code').value; return false;"
        class="flex flex-col"
      >
        <label class="block mb-4 text-gray-700 font-medium">
          Код подтверждения
          <input
            id="code"
            name="code"
            type="text"
            value="${code}"
            placeholder="Введите код"
            maxlength="4"
            class="mt-2 w-full border rounded-lg px-4 py-3 text-center text-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
        >
          Подтвердить
        </button>
      </form>
      ${code && !isValid
        ? `<p class="mt-4 text-red-600 text-center font-medium">Неверный код</p>`
        : ``
      }
    </div>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
