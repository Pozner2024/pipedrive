const API_TOKEN = "2691967257a09c24d5cba49db62bc707288c352e"; // Ваш API токен

// Очистка формы и изменение цвета кнопки при обновлении страницы
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("jobForm");
  if (form) {
    form.reset(); // Очищает все поля формы
  }

  const createJobButton = document.getElementById("createJob");
  if (createJobButton && createJobButton.textContent === "Request is sent") {
    createJobButton.style.backgroundColor = "red"; // Меняем цвет на красный
    createJobButton.style.color = "white"; // Текст становится белым
  }
});

// Проверка заполненности полей и исключение ввода только пробелов
function areFieldsValid(formData) {
  return Object.values(formData).every(
    (value) => value.trim() !== "" && value.trim().length > 0
  );
}

// Запрещаем ввод только пробелов
function preventSpacesOnlyInput() {
  const inputs = document.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.addEventListener("input", (event) => {
      const trimmedValue = event.target.value.trim();
      if (trimmedValue === "" && event.target.value !== "") {
        event.target.value = ""; // Удаляем пробелы, если они вводятся
      }
    });
  });
}

// Инициализация предотвращения ввода только пробелов
preventSpacesOnlyInput();

// Обработка отправки формы
document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Предотвращаем перезагрузку страницы

  const createJobButton = document.getElementById("createJob");

  // Собираем данные из формы
  const formData = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    jobDescription: document.getElementById("jobDescription").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    zipCode: document.getElementById("zipCode").value.trim(),
  };

  // Проверяем, заполнены ли все поля
  if (!areFieldsValid(formData)) {
    alert("Please fill out all fields correctly."); // Сообщение об ошибке
    return;
  }

  try {
    // Меняем стиль кнопки
    createJobButton.classList.add("request-sent");
    createJobButton.textContent = "Request is sent";
    createJobButton.disabled = true;

    // Создаем контакт в Pipedrive
    const personResponse = await fetch(
      https://api.pipedrive.com/v1/persons?api_token=${API_TOKEN},
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: ${formData.firstName} ${formData.lastName}, // Имя контакта
          phone: formData.phone, // Телефон
          email: formData.email, // Электронная почта
        }),
      }
    );

    if (!personResponse.ok) {
      throw new Error("Ошибка при создании контакта");
    }

    const personData = await personResponse.json();
    const personId = personData.data.id;

    // Создаем сделку в Pipedrive
    const dealResponse = await fetch(
      https://api.pipedrive.com/v1/deals?api_token=${API_TOKEN},
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: Job for ${formData.firstName} ${formData.lastName},
          person_id: personId,
          custom_fields: {
            f303490f937e4f99fa3f4a50a8e596e9b84f519: formData.city, // City
            "2aaf201d871ccddd2f8399ea10e4848c8f8d": formData.state, // State
            c3c98919e8f5798d6cf8d4256ebb806f7af98df7: formData.zipCode, // Zip code
            "0e376118851037aa9641a20f5a14fb7e69f3ce": formData.phone, // Phone
            "03ece346735a2d76996b6fbfccad9fb507a1acd6": formData.email, // Email
            "24b47c8f4cfc29a882c76dcb0e877a1ef915252": formData.jobDescription, // Job details
            "1bfa8579d4429887c45a8c3ef0abb878d4d004d": formData.firstName, // First name
            "919e81cd1b70523f635324f2b1db833dcb4457": formData.lastName, // Last name
          },
        }),
      }
    );

    if (!dealResponse.ok) {
      throw new Error("Ошибка при создании сделки");
    }

    const dealData = await dealResponse.json();
    const dealId = dealData.data.id;

    // Создаём ссылку на сделку
    const dealUrl = https://np4.pipedrive.com/deal/${dealId};

    // Перерисовываем содержимое страницы
    const formContainer = document.getElementById("jobForm");
    formContainer.innerHTML = 
      <div class="success-message">
        <p>Deal created successfully!</p>
        <a href="${dealUrl}" target="_blank" class="btn btn-link">View Deal</a>
      </div>
    ;
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Ошибка при отправке данных.");
    createJobButton.textContent = "Create job";
    createJobButton.disabled = false;
  }
});