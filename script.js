//your code here

document.addEventListener("DOMContentLoaded", () => {
    const deck = document.getElementById("deck");
    const shuffleBtn = document.getElementById("shuffle");
    const resetBtn = document.getElementById("reset");
    const wonDiv = document.getElementById("won");

    const cards = Array.from(document.querySelectorAll(".whitebox2"));
    const holders = document.querySelectorAll(".typesOfCards .placed");

    const cardSuits = {
        "0": "S",
        "1": "C",
        "2": "C",
        "3": "D",
        "4": "S"
    };

    const holderSuits = {
        "100": "C",
        "101": "D",
        "102": "H",
        "103": "S"
    };

    function getHolderSuit(holder) {
        const img = holder.querySelector("img");
        if (!img) return "";
        return holderSuits[img.id] || "";
    }

    cards.forEach(card => {
        card.setAttribute("draggable", "true");
        card.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", card.id);
        });
    });

    holders.forEach(holder => {
        holder.addEventListener("dragover", (e) => {
            e.preventDefault();
        });
        holder.addEventListener("drop", (e) => {
            e.preventDefault();
            const cardId = e.dataTransfer.setData ? e.dataTransfer.getData("text/plain") : null;
            const card = document.getElementById(cardId);
            if (!card) return;

            const cardSuit = cardSuits[cardId];
            const targetSuit = getHolderSuit(holder);

            if (cardSuit === targetSuit) {
                holder.appendChild(card);
                saveState();
                checkWin();
            }
        });
    });

    deck.addEventListener("dragover", (e) => {
        e.preventDefault();
    });
    deck.addEventListener("drop", (e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text/plain");
        const card = document.getElementById(cardId);
        if (!card) return;

        putInDeck(card);
        saveState();
        checkWin();
    });

    function shuffleDeck() {
        const whiteboxes = Array.from(deck.querySelectorAll(".whitebox"));
        for (let i = whiteboxes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            deck.appendChild(whiteboxes[j]);
        }
    }

    function checkWin() {
        let placedCount = 0;
        cards.forEach(card => {
            const parent = card.parentElement;
            const holder = parent.closest(".placed");
            if (holder) {
                const cardSuit = cardSuits[card.id];
                const targetSuit = getHolderSuit(holder);
                if (cardSuit === targetSuit) {
                    placedCount++;
                }
            }
        });

        if (placedCount === cards.length) {
            wonDiv.style.display = "block";
            wonDiv.classList.remove("hide");
        } else {
            wonDiv.style.display = "none";
            wonDiv.classList.add("hide");
        }
    }

    function saveState() {
        const state = {};
        cards.forEach(card => {
            const parent = card.parentElement;
            if (deck.contains(card)) {
                state[card.id] = "deck";
            } else {
                const holder = parent.closest(".placed");
                if (holder) {
                    const img = holder.querySelector("img");
                    state[card.id] = img ? img.id : "deck";
                }
            }
        });
        localStorage.setItem("cardGameState", JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem("cardGameState");
        if (saved) {
            try {
                const state = JSON.parse(saved);
                cards.forEach(card => {
                    const loc = state[card.id];
                    if (loc && loc !== "deck") {
                        const holder = document.getElementById(loc)?.closest(".placed");
                        if (holder) {
                            holder.appendChild(card);
                        } else {
                            putInDeck(card);
                        }
                    } else {
                        putInDeck(card);
                    }
                });
            } catch (e) {
                initFresh();
            }
        } else {
            initFresh();
        }
        checkWin();
    }

    function putInDeck(card) {
        let whitebox = card.closest(".whitebox");
        if (!whitebox) {
            whitebox = document.createElement("div");
            whitebox.className = "whitebox";
            whitebox.appendChild(card);
        }
        deck.appendChild(whitebox);
    }

    function initFresh() {
        cards.forEach(card => {
            putInDeck(card);
        });
        shuffleDeck();
        saveState();
    }

    shuffleBtn.addEventListener("click", () => {
        cards.forEach(card => putInDeck(card));
        shuffleDeck();
        wonDiv.style.display = "none";
        wonDiv.classList.add("hide");
        localStorage.clear();
        saveState();
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            cards.forEach(card => putInDeck(card));
            shuffleDeck();
            wonDiv.style.display = "none";
            wonDiv.classList.add("hide");
            localStorage.clear();
            saveState();
        });
    }

    loadState();
});