const API_TOKEN = "2691967257a09c24d5cba49db62bc707288c352e";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("jobForm");
  if (form) {
    form.reset();
  }

  const createJobButton = document.getElementById("createJob");
  if (createJobButton && createJobButton.textContent === "Request is sent") {
    createJobButton.style.backgroundColor = "red";
    createJobButton.style.color = "white";
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
        event.target.value = "";
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
            f303490f937e4f99fa3f4a50a8e596e9b84f519: formData.city,
            "2aaf201d871ccddd2f8399ea10e4848c8f8d": formData.state,
            c3c98919e8f5798d6cf8d4256ebb806f7af98df7: formData.zipCode,
            "0e376118851037aa9641a20f5a14fb7e69f3ce": formData.phone,
            "03ece346735a2d76996b6fbfccad9fb507a1acd6": formData.email,
            "24b47c8f4cfc29a882c76dcb0e877a1ef915252": formData.jobDescription,
            "1bfa8579d4429887c45a8c3ef0abb878d4d004d": formData.firstName,
            "919e81cd1b70523f635324f2b1db833dcb4457": formData.lastName,
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
