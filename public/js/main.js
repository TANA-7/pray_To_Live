let cart = document.querySelector(".cart");
function open_cart() {
  cart.classList.toggle("active");
}

window.onload = function () {
    // counter script
    let count = 0;
    const countElement = document.getElementById("counter");
    const target = 1000;
  
    function updateCounter() {
      if (count < target) {
        count += 1;
        countElement.textContent = count;
        setTimeout(updateCounter, 5);
      }
    }
    updateCounter();
  
  
    // verses script
    const verses = [
      "إن الصلاة تنهى عن الفحشاء والمنكر",
      "وأقم الصلاة إن الصلاة تنهى عن الفحشاء والمنكر",
      "أرحنا بها يا بلال",
      "العهد الذي بيننا وبينهم الصلاة، فمن تركها فقد كفر",
      "إن أول ما يحاسب به العبد يوم القيامة صلاته",
      "حافظوا على الصلوات والصلاة الوسطى",
      "وكان يأمر أهله بالصلاة"
    ];
  
    const verseText = document.getElementById("verse-text");
  
    function showRandomVerse() {
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];
      verseText.textContent = `"${randomVerse}"`;
    }
  
    showRandomVerse();
    setInterval(showRandomVerse, 10000);
  };

  
  
