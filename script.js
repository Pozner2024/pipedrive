require("dotenv").config(); // Загружаем переменные окружения из .env

const API_TOKEN = process.env.API_TOKEN; // Берём токен из .env

// Ключи полей из .env
const FIELD_KEYS = {
  city: process.env.CITY_FIELD_KEY,
  state: process.env.STATE_FIELD_KEY,
  zipCode: process.env.ZIPCODE_FIELD_KEY,
  phone: process.env.PHONE_FIELD_KEY,
  email: process.env.EMAIL_FIELD_KEY,
  jobDescription: process.env.JOB_DESCRIPTION_FIELD_KEY,
  firstName: process.env.FIRST_NAME_FIELD_KEY,
  lastName: process.env.LAST_NAME_FIELD_KEY,
};

// Проверяем, есть ли все необходимые переменные
if (!API_TOKEN || Object.values(FIELD_KEYS).some((key) => !key)) {
  console.error(
    "Не все переменные окружения установлены. Убедитесь, что все ключи заданы в файле .env"
  );
  process.exit(1);
}

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

function areFieldsValid(formData) {
  return Object.values(formData).every(
    (value) => value.trim() !== "" && value.trim().length > 0
  );
}

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

preventSpacesOnlyInput();

document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const createJobButton = document.getElementById("createJob");

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

  if (!areFieldsValid(formData)) {
    alert("Please fill out all fields correctly.");
    return;
  }

  try {
    createJobButton.classList.add("request-sent");
    createJobButton.textContent = "Request is sent";
    createJobButton.disabled = true;

    const personResponse = await fetch(
      `https://api.pipedrive.com/v1/persons?api_token=${API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          email: formData.email,
        }),
      }
    );

    if (!personResponse.ok) {
      throw new Error("Ошибка при создании контакта");
    }

    const personData = await personResponse.json();
    const personId = personData.data.id;

    const dealResponse = await fetch(
      `https://api.pipedrive.com/v1/deals?api_token=${API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Job for ${formData.firstName} ${formData.lastName}`,
          person_id: personId,
          custom_fields: {
            [FIELD_KEYS.city]: formData.city,
            [FIELD_KEYS.state]: formData.state,
            [FIELD_KEYS.zipCode]: formData.zipCode,
            [FIELD_KEYS.phone]: formData.phone,
            [FIELD_KEYS.email]: formData.email,
            [FIELD_KEYS.jobDescription]: formData.jobDescription,
            [FIELD_KEYS.firstName]: formData.firstName,
            [FIELD_KEYS.lastName]: formData.lastName,
          },
        }),
      }
    );

    if (!dealResponse.ok) {
      throw new Error("Ошибка при создании сделки");
    }

    const dealData = await dealResponse.json();
    const dealId = dealData.data.id;

    const dealUrl = `https://np4.pipedrive.com/deal/${dealId}`;

    const formContainer = document.getElementById("jobForm");
    formContainer.innerHTML = `
      <div class="success-message">
        <p>Deal created successfully!</p>
        <a href="${dealUrl}" target="_blank" class="btn btn-link">View Deal</a>
      </div>
    `;
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Ошибка при отправке данных.");
    createJobButton.textContent = "Create job";
    createJobButton.disabled = false;
  }
});
