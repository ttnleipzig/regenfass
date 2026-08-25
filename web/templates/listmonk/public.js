(() => {
    "use strict";

    function init() {
        document
            .querySelectorAll(".form, .manage-form, .unsub-form, .data-form")
            .forEach((form) => {
                form.addEventListener("submit", () => {
                    const button = form.querySelector("button[type='submit'], input[type='submit']");
                    if (!button) return;

                    button.disabled = true;
                    button.setAttribute("aria-busy", "true");
                    if ("value" in button) button.value = "Wird verarbeitet …";
                    else button.textContent = "Wird verarbeitet …";
                });
            });

        document.querySelectorAll("input[name='email']").forEach((input) => {
            input.addEventListener("blur", () => {
                input.value = input.value.trim().toLowerCase();
            });
        });

        document.querySelectorAll("input[name='name']").forEach((input) => {
            input.addEventListener("blur", () => {
                input.value = input.value.trim();
            });
        });

        document.querySelectorAll(".lists").forEach((list) => {
            const heading = list.querySelector("h2");
            const checkboxes = [...list.querySelectorAll("input[type='checkbox']")];
            if (!heading || checkboxes.length < 2) return;

            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "rf-list-toggle";
            toggle.textContent = "Alle abwählen";
            toggle.addEventListener("click", () => {
                const select = checkboxes.some((checkbox) => !checkbox.checked);
                checkboxes.forEach((checkbox) => { checkbox.checked = select; });
                toggle.textContent = select ? "Alle abwählen" : "Alle auswählen";
            });

            heading.appendChild(toggle);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
