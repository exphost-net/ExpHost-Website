
let globalOrderNumber = parseInt(localStorage.getItem('globalOrderNumber')) || 1000;

document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const ramSlider = document.getElementById('ram-slider');
    const storageSlider = document.getElementById('storage-slider');
    const ramValue = document.getElementById('ram-value');
    const storageValue = document.getElementById('storage-value');
    const cpuButtons = document.querySelectorAll('.cpu-button');
    const totalPrice = document.getElementById('total-price');
    const currencyToggle = document.getElementById('currency-toggle');
    const pricingCards = document.querySelectorAll('.pricing-card .price');
    const popup = document.getElementById('orderPopup');
    const closeBtn = document.querySelector('#orderPopup .close-btn');
    const popupTitle = document.getElementById('popupTitle');
    const popupSubtitle = document.getElementById('popupSubtitle');
    const configureButton = document.getElementById('configureButton');
    const contactButton = document.getElementById('contact-button');
    const contactPopup = document.getElementById('contactPopup');
    const contactCloseBtn = contactPopup.querySelector('.close-btn');
    const logo = document.querySelector('.logo');
    const navLinks = document.querySelector('.nav-links');
    //
    const pingButtonUSC1 = document.getElementById('ping-button-usc1');
    const pingStatusUSC1 = document.getElementById('ping-status-usc1');
    const pingButtonTBD = document.getElementById('ping-button-tbd');
    const pingStatusTBD = document.getElementById('ping-status-tbd');
    //
    const customOrderPopup = document.getElementById('customOrderPopup');
    const customOrderCloseBtn = customOrderPopup.querySelector('.close-btn');
    const choosePlanBtn = document.querySelector('#configurator .btn');
    const discordTicketBtn = document.getElementById('discordTicketBtn');
    const userDetailsPopup = document.getElementById('userDetailsPopup');
    const userDetailsCloseBtn = userDetailsPopup.querySelector('.close-btn');

    // Variables
    let selectedCPU = 1;
    let currentCurrency = 'USD';
    const currencies = ['USD', 'GBP', 'JPY', 'EUR'];
    let exchangeRates = { USD: 1, GBP: 1, JPY: 1, EUR: 1 };
    let isCustomPlan = false;
    let selectedPlanDetails = {};

    // Functions
    function checkOrderLimit() {
        const today = new Date().toDateString();
        let orderCount = parseInt(localStorage.getItem('orderCount')) || 0;
        let lastOrderDate = localStorage.getItem('lastOrderDate');

        if (lastOrderDate !== today) {
            orderCount = 0;
            lastOrderDate = today;
        }

        if (orderCount >= 3) {
            return false; // Limit reached
        }

        orderCount++;
        localStorage.setItem('orderCount', orderCount);
        localStorage.setItem('lastOrderDate', today);

        return true; // Order allowed
    }

    const fetchExchangeRates = async () => {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            exchangeRates = {
                USD: 1,
                GBP: data.rates.GBP,
                JPY: data.rates.JPY,
                EUR: data.rates.EUR
            };
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            exchangeRates = { USD: 1, GBP: 0.80, JPY: 110, EUR: 0.85 };
        }
    };

    const calculatePrice = () => {
        const ram = parseInt(ramSlider.value);
        const storage = parseInt(storageSlider.value);
        const cpu = selectedCPU;

        let cpuCharge = 0;
        if (cpu === 2) cpuCharge = 5;
        if (cpu === 3) cpuCharge = 10;

        let price = ram * 1.25 + (storage - 25) / 25 + cpuCharge;
        price *= exchangeRates[currentCurrency];

        totalPrice.textContent = formatCurrency(price, currentCurrency) + '/month';
    };

    const formatCurrency = (amount, currency) => {
        const formatOptions = {
            USD: { style: 'currency', currency: 'USD', minimumFractionDigits: 2 },
            GBP: { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 },
            JPY: { style: 'currency', currency: 'JPY', minimumFractionDigits: 0 },
            EUR: { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }
        };
        return new Intl.NumberFormat('en-US', formatOptions[currency]).format(amount);
    };

    const updateCurrency = (currency) => {
        currencyToggle.textContent = currency;

        pricingCards.forEach(card => {
            const usdPrice = parseFloat(card.getAttribute('data-usd-price'));
            const newPrice = usdPrice * exchangeRates[currency];
            card.textContent = formatCurrency(newPrice, currency) + '/mo';
        });

        calculatePrice();
    };

    function toggleAnswer(id) {
        const answer = document.getElementById(id);
        const allAnswers = document.querySelectorAll('.faq-answer');

        allAnswers.forEach(item => {
            if (item !== answer && item.classList.contains('active')) {
                item.classList.remove('active');
            }
        });

        answer.classList.toggle('active');
    }

    function openContactDetails() {
        userDetailsPopup.style.display = 'flex';
        document.getElementById('userEmail').focus();
    }

    // Event Listeners
    fetchExchangeRates();

    currencyToggle.addEventListener('click', async () => {
        const currentIndex = currencies.indexOf(currentCurrency);
        currentCurrency = currencies[(currentIndex + 1) % currencies.length];
        await fetchExchangeRates();
        updateCurrency(currentCurrency);
    });

    ramSlider.addEventListener('input', () => {
        ramValue.textContent = ramSlider.value;
        calculatePrice();
    });

    storageSlider.addEventListener('input', () => {
        storageValue.textContent = storageSlider.value;
        calculatePrice();
    });

    cpuButtons.forEach(button => {
        button.addEventListener('click', () => {
            cpuButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedCPU = parseInt(button.getAttribute('data-cpu'));
            calculatePrice();
        });
    });

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        question.addEventListener('click', () => {
            item.querySelector('.faq-answer').classList.toggle('active');
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('.faq-answer').classList.remove('active');
                }
            });
        });
    });

    // Modify the event listener for customize buttons
    document.querySelectorAll('.customize-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            isCustomPlan = false;
            const title = button.getAttribute('data-title');
            const price = button.getAttribute('data-price');
            const ram = button.getAttribute('data-ram');
            const cpu = button.getAttribute('data-cpu');
            const storage = button.getAttribute('data-storage');

            selectedPlanDetails = { title, price, ram, cpu, storage };

            popupTitle.innerText = title;
            popupSubtitle.innerHTML = `${price}<br>${ram}GB RAM, ${cpu}% CPU, ${storage}GB Storage`;
            popup.style.display = 'flex';

            // Add a new button for Discord support
            const discordSupportBtn = document.createElement('a');
            discordSupportBtn.href = 'https://discord.gg/KxXUyPbJgB';
            discordSupportBtn.className = 'popup-btn';
            discordSupportBtn.textContent = 'Discord Support';
            discordSupportBtn.target = '_blank';

            // Create the billing panel button with a dynamic link
            const billingBtn = document.createElement('a');
            billingBtn.href = getBillingPanelLink(title);
            billingBtn.className = 'popup-btn';
            billingBtn.textContent = 'Checkout';
            billingBtn.target = '_blank';

            // Replace the existing buttons with new ones
            const popupButtons = popup.querySelector('.popup-buttons');
            popupButtons.innerHTML = '';
            popupButtons.appendChild(discordSupportBtn);
            popupButtons.appendChild(billingBtn);
        });
    });

    // Function to get the appropriate billing panel link based on the plan
    function getBillingPanelLink(planTitle) {
        switch (planTitle) {
            case 'Basic':
                return '//billing.exphost.net/checkout/config/2';
            case 'Standard':
                return '//billing.exphost.net/checkout/config/6';
            case 'Advanced':
                return '//billing.exphost.net/checkout/config/7';
            case 'Premium':
                return '//billing.exphost.net/checkout/config/8';
            case 'Ultimate':
                return '//billing.exphost.net/checkout/config/10';
            case 'Custom':
                return '//billing.exphost.net/checkout/config/9';
            default:
                return '//billing.exphost.net';
        }
    }

    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    configureButton.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    contactButton.addEventListener('click', (e) => {
        e.preventDefault();
        contactPopup.style.display = 'flex';
    });

    contactCloseBtn.addEventListener('click', () => {
        contactPopup.style.display = 'none';
    });

    logo.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    function pingHTTP(url, element) {
        function sendPing() {
            const startTime = performance.now();
            fetch(url, { method: 'HEAD', mode: 'no-cors' })
                .then(() => {
                    const endTime = performance.now();
                    const pingTime = Math.round(endTime - startTime);
                    element.innerHTML = `${pingTime}ms`;
                    element.style.color = '#4CAF50';
                })
                .catch(() => {
                    element.innerHTML = "Failed to ping.";
                    element.style.color = '#FF6B6B';
                });
        }
        // Send the initial ping immediately
        sendPing();
        // Send additional pings at intervals
        const interval = setInterval(sendPing, 1000);
        // Stop sending pings after a certain period of time
        setTimeout(() => {
            clearInterval(interval);
            pingButtonUSC1.disabled = false;
        }, 1000 * 10);
    }

    pingButtonUSC1.addEventListener('click', function () {
        pingStatusUSC1.textContent = 'Pinging...';
        pingStatusUSC1.style.color = '#fcef5b';
        pingButtonUSC1.disabled = true;
        pingHTTP("node.exphost.net", pingStatusUSC1);
    });

    pingButtonTBD.addEventListener('click', function () {
        pingStatusTBD.textContent = 'Pinging...';
        pingStatusTBD.style.color = '#fcef5b';
        pingButtonTBD.disabled = true;
        pingHTTP("cloud.cryogena.net", pingStatusTBD);
    });

    choosePlanBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (checkOrderLimit()) {
            isCustomPlan = true;
            selectedPlanDetails = {
                title: 'Custom Plan',
                price: totalPrice.textContent,
                ram: ramValue.textContent,
                cpu: document.querySelector('.cpu-button.active').textContent,
                storage: storageValue.textContent
            };
            customOrderPopup.style.display = 'flex';
        } else {
            alert('You have reached the maximum number of orders (3) for today. Please try again tomorrow.');
        }
    });

    customOrderCloseBtn.addEventListener('click', () => {
        customOrderPopup.style.display = 'none';
    });

    discordTicketBtn.addEventListener('click', (e) => {
        e.preventDefault();
        customOrderPopup.style.display = 'none';
        openContactDetails();
    });

    userDetailsCloseBtn.addEventListener('click', () => {
        userDetailsPopup.style.display = 'none';
    });

    document.getElementById('userDetailsForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!checkOrderLimit()) {
            alert('You have reached the maximum number of orders (3) for today. Please try again tomorrow.');
            return;
        }

        globalOrderNumber++;
        localStorage.setItem('globalOrderNumber', globalOrderNumber);

        const userEmail = document.getElementById('userEmail').value;
        const userDiscord = document.getElementById('userDiscord').value;
        const orderName = document.getElementById('orderName').value;

        const message = {
            content: `New order created #${globalOrderNumber}`,
            embeds: [{
                title: `Order #${globalOrderNumber}: ${orderName}`,
                fields: [
                    { name: 'Plan', value: selectedPlanDetails.title, inline: true },
                    { name: 'RAM', value: `${selectedPlanDetails.ram}GB`, inline: true },
                    { name: 'CPU', value: `${selectedPlanDetails.cpu}%`, inline: true },
                    { name: 'Storage', value: `${selectedPlanDetails.storage}GB`, inline: true },
                    { name: 'Price', value: selectedPlanDetails.price },
                    { name: 'Email', value: userEmail },
                    { name: 'Discord Username', value: userDiscord }
                ]
            }]
        };

        const webhookURL = 'https://discord.com/api/webhooks/1258438054973018132/wp-ANKYT1A6hPGAifzKs7-uhHEmkAhWstdg0bzmrKew-kKAja5ffpAr4Iv6P9X8EKEuQ';
        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });

            if (response.ok) {
                alert(`Order #${globalOrderNumber} has been created and sent to Discord!\n\nPlease remember or write down your order number: \n\n**${globalOrderNumber}**\n\nYou will be redirected to our Discord server in a few seconds.`);
                userDetailsPopup.style.display = 'none';

                // Open Discord server link in a new tab after a short delay
                setTimeout(() => {
                    window.open('https://discord.gg/KxXUyPbJgB', '_blank');
                }, 2000); // 2 seconds delay
            } else {
                throw new Error('Failed to send order to Discord');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create order. Please try again.');
        }
    });

    // Initial setup
    updateCurrency(currentCurrency);
    calculatePrice();
    pingButtonUSC1.click();
    pingButtonTBD.click();
});
