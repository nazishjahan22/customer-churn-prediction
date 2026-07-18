/**
 * Customer Churn Prediction Frontend JavaScript
 * Handles form validation, DOM manipulation, loading states, API request/response, and resets.
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const form = document.getElementById("churnForm");
    const submitBtn = document.getElementById("submitBtn");
    const resetBtn = document.getElementById("resetBtn");
    const resultCard = document.getElementById("resultCard");
    const resultText = document.getElementById("resultText");
    const probabilityVal = document.getElementById("probabilityVal");
    const probabilityBar = document.getElementById("probabilityBar");
    const closeResultBtn = document.getElementById("closeResultBtn");
    const errorMessage = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    // Constants
    // TODO: Replace the production URL with your actual deployed Render service URL if different

    const PRODUCTION_API_URL = "https://customer-churn-prediction-ojum.onrender.com/predict";
    const API_URL = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost")
        ? "http://127.0.0.1:8001/predict"
        : PRODUCTION_API_URL;


    // Close Prediction Card Action
    closeResultBtn.addEventListener("click", () => {
        resultCard.classList.add("hidden");
    });

    // Reset Form Action
    resetBtn.addEventListener("click", () => {
        // Clear all inputs/selects in the form
        form.reset();

        // Remove validation error stylings
        const formGroups = document.querySelectorAll(".form-group");
        formGroups.forEach(group => {
            group.classList.remove("invalid");
        });

        // Hide result and error cards
        resultCard.classList.add("hidden");
        errorMessage.classList.add("hidden");
    });

    // Form Submission Handler
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Run Validation
        const isValid = validateForm();
        if (!isValid) {
            // Scroll to the first validation error if exists
            const firstInvalid = document.querySelector(".form-group.invalid");
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        // Hide previous feedback
        resultCard.classList.add("hidden");
        errorMessage.classList.add("hidden");

        // 2. Set Loading State
        setLoading(true);

        // 3. Assemble JSON Payload
        const payload = assemblePayload();

        try {
            // 4. Send POST request via Fetch API
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 5. Render Response Card
            renderResult(data);

        } catch (error) {
            // Log details for debugging
            console.error("Prediction Error:", error);

            // Show user-friendly error message
            errorText.textContent = "Unable to connect to the machine learning server. Please ensure that the FastAPI backend is running on port 8001.";
            errorMessage.classList.remove("hidden");
            errorMessage.scrollIntoView({ behavior: "smooth", block: "center" });
        } finally {
            // 6. Restore Submit Button
            setLoading(false);
        }
    });

    /**
     * Validates all form inputs, marking invalid fields visually.
     * @returns {boolean} True if the form is completely valid, false otherwise.
     */
    function validateForm() {
        let isFormValid = true;

        // Validate Select Fields
        const selects = form.querySelectorAll("select");
        selects.forEach(select => {
            const parent = select.closest(".form-group");
            if (select.value === "") {
                parent.classList.add("invalid");
                isFormValid = false;
            } else {
                parent.classList.remove("invalid");
            }
        });

        // Validate Numeric Inputs
        const tenureInput = document.getElementById("tenure");
        const monthlyChargesInput = document.getElementById("MonthlyCharges");
        const totalChargesInput = document.getElementById("TotalCharges");

        // Tenure check (non-empty, non-negative integer)
        if (tenureInput.value === "" || isNaN(tenureInput.value) || parseInt(tenureInput.value, 10) < 0) {
            tenureInput.closest(".form-group").classList.add("invalid");
            isFormValid = false;
        } else {
            tenureInput.closest(".form-group").classList.remove("invalid");
        }

        // Monthly charges check (non-empty, non-negative float)
        if (monthlyChargesInput.value === "" || isNaN(monthlyChargesInput.value) || parseFloat(monthlyChargesInput.value) < 0) {
            monthlyChargesInput.closest(".form-group").classList.add("invalid");
            isFormValid = false;
        } else {
            monthlyChargesInput.closest(".form-group").classList.remove("invalid");
        }

        // Total charges check (non-empty, non-negative float)
        if (totalChargesInput.value === "" || isNaN(totalChargesInput.value) || parseFloat(totalChargesInput.value) < 0) {
            totalChargesInput.closest(".form-group").classList.add("invalid");
            isFormValid = false;
        } else {
            totalChargesInput.closest(".form-group").classList.remove("invalid");
        }

        return isFormValid;
    }

    /**
     * Toggles button state and spinner visibility.
     * @param {boolean} isLoading - Loading status flag.
     */
    function setLoading(isLoading) {
        const btnText = submitBtn.querySelector(".btn-text");
        const spinner = submitBtn.querySelector(".spinner");

        if (isLoading) {
            submitBtn.disabled = true;
            spinner.classList.remove("hidden");
            btnText.textContent = "Analyzing Customer Data...";
        } else {
            submitBtn.disabled = false;
            spinner.classList.add("hidden");
            btnText.textContent = "Predict Churn Risk";
        }
    }

    /**
     * Extracts values from input fields and structures the JSON object matching CustomerData schema.
     * @returns {Object} Structured data payload for API call.
     */
    function assemblePayload() {
        return {
            gender: document.getElementById("gender").value,
            SeniorCitizen: parseInt(document.getElementById("SeniorCitizen").value, 10),
            Partner: document.getElementById("Partner").value,
            Dependents: document.getElementById("Dependents").value,
            tenure: parseInt(document.getElementById("tenure").value, 10),
            PhoneService: document.getElementById("PhoneService").value,
            MultipleLines: document.getElementById("MultipleLines").value,
            InternetService: document.getElementById("InternetService").value,
            OnlineSecurity: document.getElementById("OnlineSecurity").value,
            OnlineBackup: document.getElementById("OnlineBackup").value,
            DeviceProtection: document.getElementById("DeviceProtection").value,
            TechSupport: document.getElementById("TechSupport").value,
            StreamingTV: document.getElementById("StreamingTV").value,
            StreamingMovies: document.getElementById("StreamingMovies").value,
            Contract: document.getElementById("Contract").value,
            PaperlessBilling: document.getElementById("PaperlessBilling").value,
            PaymentMethod: document.getElementById("PaymentMethod").value,
            MonthlyCharges: parseFloat(document.getElementById("MonthlyCharges").value),
            TotalCharges: parseFloat(document.getElementById("TotalCharges").value)
        };
    }

    /**
     * Renders predictions, updating themes to red (churn danger) or green (retention success).
     * @param {Object} data - Prediction output containing prediction string and probability score.
     */
    function renderResult(data) {
        // Clear previous color states
        resultCard.classList.remove("success-card", "danger-card");

        // Format prediction text and percentage
        resultText.textContent = data.prediction;

        // Probability range [0.0 - 1.0]. Convert to percentage.
        const probabilityPercentage = Math.round(data.probability * 100);
        probabilityVal.textContent = `${probabilityPercentage}%`;
        probabilityBar.style.width = `${probabilityPercentage}%`;

        // Update colors based on warning classification
        if (data.prediction === "Customer Will Churn") {
            resultCard.classList.add("danger-card");
        } else {
            resultCard.classList.add("success-card");
        }

        // Present results card with a smooth scrolling offset
        resultCard.classList.remove("hidden");
        resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
});
