// Brands Section
const cardsContainer = document.querySelector(".card-carousel");
const cardsController = document.querySelector(
  ".card-carousel + .card-controller"
);

class DraggingEvent {
  constructor(target = undefined) {
    this.target = target;
  }

  event(callback) {
    let handler;

    this.target.addEventListener("mousedown", (e) => {
      e.preventDefault();

      handler = callback(e);

      window.addEventListener("mousemove", handler);
      document.addEventListener("mouseleave", clearDraggingEvent);
      window.addEventListener("mouseup", clearDraggingEvent);

      function clearDraggingEvent() {
        window.removeEventListener("mousemove", handler);
        window.removeEventListener("mouseup", clearDraggingEvent);
        document.removeEventListener("mouseleave", clearDraggingEvent);
        handler(null);
      }
    });

    this.target.addEventListener("touchstart", (e) => {
      handler = callback(e);

      window.addEventListener("touchmove", handler);
      window.addEventListener("touchend", clearDraggingEvent);
      document.body.addEventListener("mouseleave", clearDraggingEvent);

      function clearDraggingEvent() {
        window.removeEventListener("touchmove", handler);
        window.removeEventListener("touchend", clearDraggingEvent);
        handler(null);
      }
    });
  }

  // Get the distance that the user has dragged
  getDistance(callback) {
    function distanceInit(e1) {
      let startingX, startingY;

      if ("touches" in e1) {
        startingX = e1.touches[0].clientX;
        startingY = e1.touches[0].clientY;
      } else {
        startingX = e1.clientX;
        startingY = e1.clientY;
      }

      return function (e2) {
        if (e2 === null) {
          return callback(null);
        } else {
          if ("touches" in e2) {
            return callback({
              x: e2.touches[0].clientX - startingX,
              y: e2.touches[0].clientY - startingY,
            });
          } else {
            return callback({
              x: e2.clientX - startingX,
              y: e2.clientY - startingY,
            });
          }
        }
      };
    }

    this.event(distanceInit);
  }
}

class CardCarousel extends DraggingEvent {
  constructor(container, controller = undefined) {
    super(container);

    // DOM elements
    this.container = container;
    this.controllerElement = controller;
    this.cards = container.querySelectorAll(".card");

    // Carousel data
    this.centerIndex = (this.cards.length - 1) / 2;
    this.cardWidth =
      (this.cards[0].offsetWidth / this.container.offsetWidth) * 100;
    this.xScale = {};

    // Resizing
    window.addEventListener("resize", this.updateCardWidth.bind(this));

    if (this.controllerElement) {
      this.controllerElement.addEventListener(
        "keydown",
        this.controller.bind(this)
      );
    }

    // Initializers
    this.build();

    // Bind dragging event
    super.getDistance(this.moveCards.bind(this));

    // Start automatic sliding
    this.startAutoSlide();
  }

  startAutoSlide() {
    setInterval(() => {
      this.slideNext();
    }, 8000);
  }

  slideNext() {
    const temp = { ...this.xScale };

    for (let x in this.xScale) {
      const newX =
        parseInt(x) - 1 < -this.centerIndex
          ? this.centerIndex
          : parseInt(x) - 1;
      temp[newX] = this.xScale[x];
    }

    this.xScale = temp;

    for (let x in temp) {
      const scale = this.calcScale(x),
        scale2 = this.calcScale2(x),
        leftPos = this.calcPos(x, scale2),
        zIndex = -Math.abs(x);

      this.updateCards(this.xScale[x], {
        x: x,
        scale: scale,
        leftPos: leftPos,
        zIndex: zIndex,
      });
    }
  }

  updateCardWidth() {
    this.cardWidth =
      (this.cards[0].offsetWidth / this.container.offsetWidth) * 100;
    this.build();
  }

  build(fix = 0) {
    for (let i = 0; i < this.cards.length; i++) {
      const x = i - this.centerIndex;
      const scale = this.calcScale(x);
      const scale2 = this.calcScale2(x);
      const zIndex = -Math.abs(i - this.centerIndex);

      const leftPos = this.calcPos(x, scale2);

      this.xScale[x] = this.cards[i];

      this.updateCards(this.cards[i], {
        x: x,
        scale: scale,
        leftPos: leftPos,
        zIndex: zIndex,
      });
    }
  }

  controller(e) {
    const temp = { ...this.xScale };

    if (e.keyCode === 39) {
      // Left arrow
      for (let x in this.xScale) {
        const newX =
          parseInt(x) - 1 < -this.centerIndex
            ? this.centerIndex
            : parseInt(x) - 1;
        temp[newX] = this.xScale[x];
      }
    }

    if (e.keyCode == 37) {
      // Right arrow
      for (let x in this.xScale) {
        const newX =
          parseInt(x) + 1 > this.centerIndex
            ? -this.centerIndex
            : parseInt(x) + 1;
        temp[newX] = this.xScale[x];
      }
    }

    this.xScale = temp;

    for (let x in temp) {
      const scale = this.calcScale(x),
        scale2 = this.calcScale2(x),
        leftPos = this.calcPos(x, scale2),
        zIndex = -Math.abs(x);

      this.updateCards(this.xScale[x], {
        x: x,
        scale: scale,
        leftPos: leftPos,
        zIndex: zIndex,
      });
    }
  }

  calcPos(x, scale) {
    let formula;

    if (x < 0) {
      formula = (scale * 100 - this.cardWidth) / 2;
      return formula;
    } else if (x > 0) {
      formula = 100 - (scale * 100 + this.cardWidth) / 2;
      return formula;
    } else {
      formula = 100 - (scale * 100 + this.cardWidth) / 2;
      return formula;
    }
  }

  updateCards(card, data) {
    const socialLinksContainer = document.getElementById("social-links"); // Ensure this element exists

    if (data.x || data.x === 0) {
      card.setAttribute("data-x", data.x);
    }

    if (data.scale || data.scale === 0) {
      card.style.transform = `scale(${data.scale})`;
      card.style.opacity = data.scale === 0 ? 0 : 1;
    }

    if (data.leftPos) {
      card.style.left = `${data.leftPos}%`;
    }

    if (data.zIndex || data.zIndex === 0) {
      if (data.zIndex === 0) {
        card.classList.add("highlight");

        const dynamicTitle = document.getElementById("dynamic-title");
        const dynamicParagraph = document.getElementById("dynamic-paragraph");
        const socialLinksContainer = document.getElementById("social-links"); // Ensure this element exists

        // Ensure dynamicTitle and dynamicParagraph exist
        if (dynamicTitle && dynamicParagraph) {
          // Update paragraph text based on the card ID or any other logic
          switch (card.id) {
            case "1":
              dynamicTitle.textContent = "Pares Retiro";
              dynamicParagraph.textContent =
                "Pares Retiro is one of the biggest PARES brands in the Philippines, with over 25+ branches nationwide. It is known for its sweet and savory Beef pares, paired with the best-tasting fried rice and rich and flavorful beef broth. It caters to the taste buds of both Filipinos and tourists because of its rich, flavorful, and comforting taste of home.";  
              socialLinksContainer.innerHTML = `
                                <a href="https://facebook.com/paresretiro" target="_blank"><i class='bx bxl-facebook-circle'></i></a>
                                <a href="https://instagram.com/paresretiro" target="_blank"><i class='bx bxl-instagram-alt'></i></a>
                                <a href="https://www.tiktok.com/@paresretiroph" target="_blank"><i class='bx bxl-tiktok'></i></a>
                                <a href="https://site.paresretiro.com/" target="_blank"><i class='bx bx-link'></i></a>
                            `;
              break;
            case "2":
              dynamicTitle.textContent = "The Sandwich Guy";
              dynamicParagraph.textContent =
                "The Sandwich Guy, a beloved spot in town, introduced the first hexagon sandwich, offering a unique twist on the classic. This innovative design not only looks appealing but ensures an even bite with every mouthful. Fresh ingredients and bold flavors make this sandwich a standout for busy, health-conscious customers.";
              socialLinksContainer.innerHTML = `
                                <a href="https://www.facebook.com/Thesandwichguy/" target="_blank"><i class='bx bxl-facebook-circle'></i></a>
                                <a href="https://www.instagram.com/thesandwichguy/?hl=en" target="_blank"><i class='bx bxl-instagram-alt'></i></a>
                                <a href="https://www.tiktok.com/@tsg2008_" target="_blank"><i class='bx bxl-tiktok'></i></a>
                                <a href="https://www.thesandwichguy.com/" target="_blank"><i class='bx bx-link'></i></a>
                            `;
              break;
            case "3":
              dynamicTitle.textContent = "CaliPizza";
              dynamicParagraph.textContent =
                "CaliPizza is known for its West Coast-inspired pizzas, blending fresh, high-quality ingredients with bold, creative flavors. From classic favorites to unique combinations, each pizza is made to order with a perfectly crispy crust. CaliPizza's menu caters to every taste, offering a slice of California in every bite.";
              socialLinksContainer.innerHTML = `
                                <a href="https://www.facebook.com/calipizzaph/" target="_blank"><i class='bx bxl-facebook-circle'></i></a>
                                <a href="https://www.instagram.com/calipizzaph/" target="_blank"><i class='bx bxl-instagram-alt'></i></a>
                                <a href="https://www.tiktok.com/@calipizzaph?lang=en" target="_blank"><i class='bx bxl-tiktok'></i></a>
                            `;
              break;
            case "4":
              dynamicTitle.textContent = "California Beach Pansol";
              dynamicParagraph.textContent =
                "California Beach Pansol in Laguna offers the best accommodation for those seeking relaxation and fun. Known for its natural hot spring pools, this resort provides comfortable rooms and spacious villas, perfect for families and groups. Its scenic views, modern amenities, and tranquil atmosphere make it an ideal getaway in Pansol, Laguna.";
              socialLinksContainer.innerHTML = `
                                <a href="https://www.facebook.com/californiabeachpansol/" target="_blank"><i class='bx bxl-facebook-circle'></i></a>
                                <a href="https://www.instagram.com/californiabeachpansol/?hl=en" target="_blank"><i class='bx bxl-instagram-alt'></i></a>
                                <a href="https://www.tiktok.com/@californiabeachpansol" target="_blank"><i class='bx bxl-tiktok'></i></a>
                                <a href="https://californiapansol.com/" target="_blank"><i class='bx bx-link'></i></a>
                            `;
              break;
            case "5":
              dynamicTitle.textContent = "California Beach Pizzeria";
              dynamicParagraph.textContent = 
                "California Beach Pizzeria, located beside California Beach Pansol, offers a delicious range of freshly baked pizzas that perfectly complement your stay. Known for its crispy crusts and generous toppings, the pizzeria serves both classic and unique flavors. It's the perfect spot to enjoy a flavorful meal after a relaxing dip in the hot springs.";
              socialLinksContainer.innerHTML = `
                                <a href="https://www.facebook.com/californiabeachpizza/" target="_blank"><i class='bx bxl-facebook-circle'></i></a>
                                <a href=https://www.instagram.com/californiabeachpizza/"" target="_blank"><i class='bx bxl-instagram-alt'></i></a>
                                <a href="https://www.tiktok.com/@calibeachpizzeria" target="_blank"><i class='bx bxl-tiktok'></i></i></a>
                                <a href="https://calibeachpizza.com/" target="_blank"><i class='bx bx-link'></i></a>
                            `;
              break;
            case "6":
              dynamicTitle.textContent = "Kalye Express";
              dynamicParagraph.textContent =
                "Kalye Express is an affordable alternative to Pares Retiro, offering the same delicious beef pares at a cut-rate price. Known for its quick service and generous portions, it’s a favorite spot for locals seeking a satisfying meal without breaking the bank.";
              socialLinksContainer.innerHTML = `
                                <a href="https://www.facebook.com/ParesKalyeExpress/" target="_blank"><i class='bx bxl-facebook-circle'></i></a>
                            `;
              break;
            case "7":
              dynamicTitle.textContent = "Sapporo";
              dynamicParagraph.textContent = 
                "Sapporo Milk Tea & Coffee is celebrated for its authentic Japanese flavors, featuring creamy and delicious milk teas that are both affordable and indulgent. Committed to quality, Sapporo uses premium ingredients, and ensures its low-carb quality by using non-dairy milk and sugar substitutes. Sapporo provides a guilt-free treat without sacrificing taste, making it the ultimate destination for delightful snacks and beverages.";
              socialLinksContainer.innerHTML = `
                                <a href="https://www.facebook.com/sapporomilktea/?locale=bg_BG" target="_blank"><i class='bx bxl-facebook-circle'></i></a>
                                <a href="https://www.instagram.com/sapporomilktea/" target="_blank"><i class='bx bxl-instagram-alt'></i></a>
                                <a href="https://www.tiktok.com/@sapporo.milktea" target="_blank"><i class='bx bxl-tiktok'></i></i></a>
                            `;
              break;
            default:
              dynamicTitle.textContent = "Default Title";
              dynamicParagraph.textContent = "Default paragraph text.";
              socialLinksContainer.innerHTML = "";
              break;
          }
        }
      } else {
        card.classList.remove("highlight");
      }

      card.style.zIndex = data.zIndex;
    }
  }

  calcScale2(x) {
    let formula;

    if (x <= 0) {
      formula = 1 - (-1 / 5) * x;
      return formula;
    } else if (x > 0) {
      formula = 1 - (1 / 5) * x;
      return formula;
    }
  }

  calcScale(x) {
    const formula = 1 - (1 / 5) * Math.pow(x, 2);
    return formula <= 0 ? 0 : formula;
  }

  checkOrdering(card, x, xDist) {
    const original = parseInt(card.dataset.x);
    const rounded = Math.round(xDist);
    let newX = x;

    if (x !== x + rounded) {
      if (x + rounded > original) {
        if (x + rounded > this.centerIndex) {
          newX =
            x + rounded - 1 - this.centerIndex - rounded + -this.centerIndex;
        }
      } else if (x + rounded < original) {
        if (x + rounded < -this.centerIndex) {
          newX =
            x + rounded + 1 + this.centerIndex - rounded + this.centerIndex;
        }
      }

      this.xScale[newX + rounded] = card;
    }

    const temp = -Math.abs(newX + rounded);
    this.updateCards(card, { zIndex: temp });

    return newX;
  }

  moveCards(data) {
    let xDist;

    if (data != null) {
      this.container.classList.remove("smooth-return");
      xDist = data.x / 250;
    } else {
      this.container.classList.add("smooth-return");
      xDist = 0;

      for (let x in this.xScale) {
        this.updateCards(this.xScale[x], {
          x: x,
          zIndex: Math.abs(Math.abs(x) - this.centerIndex),
        });
      }
    }

    for (let i = 0; i < this.cards.length; i++) {
      const x = this.checkOrdering(
          this.cards[i],
          parseInt(this.cards[i].dataset.x),
          xDist
        ),
        scale = this.calcScale(x + xDist),
        scale2 = this.calcScale2(x + xDist),
        leftPos = this.calcPos(x + xDist, scale2);

      this.updateCards(this.cards[i], {
        scale: scale,
        leftPos: leftPos,
      });
    }
  }
}

const carousel = new CardCarousel(cardsContainer);
