class Gladiator {
  constructor(name, health, power, speed) {
    this.name = name;
    this.initialHealth = health;
    this.health = health;
    this.power = power;
    this.initialSpeed = speed;
    this.speed = speed;
  }
  getSpeed = () => {
    if (this.health < 30) { 
      return this.speed * 3
    }
    return this.speed;
  };
  dealDamage = (opponent) => {
    opponent.takeDamage(this);
  };
  takeDamage = (opponent) => {
    this.health -= opponent.power;
    this.speed = this.initialSpeed * this.health / this.initialHealth;
  };
  recover = () => {
    this.health += 50;
  };
}

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

let gladiators = [];
const getMillisecondsFromSpeed = speed => 6000 - 1000 * speed;
const generateGladiators = () => {
  const n = faker.random.number({ min: 2, max: 8 });
  faker.locale = "az";
  let i = 0;
  while (i < n) {
    gladiators.push(
      new Gladiator(
        faker.name.findName(),
        faker.random.number({ min: 80, max: 100 }),
        faker.random.number({ min: 120, max: 150 }) / 10, //TODO
        faker.random.number({ min: 1000, max: 5000 }) / 1000
      )
    );
    i++;
  }
};

const getAnotherGladiator = (gladiators, gladiator) => {
  const newArr = gladiators.filter(g => g !== gladiator);
  return newArr.sample();
};

const openDialog = (listener1, listener2, name) => {
  const html = `<div class="custom-modal">
    <div class="modal-bg-overlay"></div>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">${name} is dying!</h4>
        </div>
        <div class="modal-body">Caesar's decision</div>
        <div class="modal-footer">
          <button id="modal-btn-1" type="button" class="btn">Finish him</button>
          <button id="modal-btn-2" type="button" class="btn">Live</button>
        </div>
      </div>
    </div>
  </div>`
  const btn1MainText = "Finish him";
  let timeout = 4;
  document.getElementById('modal').innerHTML = html;
  const btn1 = document.getElementById('modal-btn-1');
  const btn2 = document.getElementById('modal-btn-2');
  btn1.addEventListener('click', () => { 
    clearInterval(countdown);
    closeDialog(); 
   });
  btn2.addEventListener('click', () => { 
    clearInterval(countdown);
    closeDialog();
  });
  btn1.addEventListener('click', listener1);
  btn2.addEventListener('click', listener2);

  btn1.innerText = `${btn1MainText} (${timeout + 1})`;
  const countdown = setInterval(function() {
    btn1.innerText = `${btn1MainText} (${timeout})`;
    if (timeout > 0) { 
      timeout -= 1;
    }
    else {
      btn1.click();
    }

  }, 1000);
}

const closeDialog = () => {
  document.getElementById('modal').innerHTML = "";
}

const involveCaesar = gladiator => {
  const listener1 = () => {
    caesarFinish(gladiator);
  },
  listener2 = () => {
    caesarLive(gladiator);
  }
  openDialog(listener1, listener2, gladiator.name);
}

/*
const involveCaesar = gladiator => {
  const html = `<div class="custom-modal">
    <div class="modal-bg-overlay"></div>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">${gladiator.name} is dying!</h4>
        </div>
        <div class="modal-body">Caesar's decision</div>
        <div class="modal-footer">
          <button id="modal-btn-1" type="button" class="btn">Finish him</button>
          <button id="modal-btn-2" type="button" class="btn">Live</button>
        </div>
      </div>
    </div>
  </div>`
  const btn1MainText = "Finish him";
  let timeout = 4;
  let btnClicked = false;

  document.getElementById('modal').innerHTML = html;
  const btn1 = document.getElementById('modal-btn-1');
  const btn2 = document.getElementById('modal-btn-2');
  btn1.addEventListener('click', () => {
    closeDialog();
    caesarFinish(gladiator);
  });
  btn2.addEventListener('click', () => {
    closeDialog();
    caesarLive(gladiator);
  });
  //btn1.innerText = `${btn1MainText} (${timeout + 1})`;
  // const countdown = setInterval(function() {
  //   btn1.innerText = `${btn1MainText} (${timeout})`;
  //   if (timeout > 0) { 
  //     timeout -= 1;
  //   }
  //   else {
  //     debugger;
  //     btn1.click();
  //     clearInterval(countdown);
  //   }

  // }, 1000);
}*/

const start = () => {
  for (g of gladiators) {
    fight(g, gladiators);
  }
}

const continueFight = (gladiators) => {
  for (g of gladiators) {
    fight(g, gladiators);
  }
}

const caesarFinish = (gladiator) => {
  console.log(`Caesar showed 👎 to ${gladiator.name}`);
  continueFight(gladiators.filter(g => g.health > 0));
}

const caesarLive = (gladiator) => {
  console.log(`Caesar showed 👍 to ${gladiator.name}`);
  gladiator.recover();
  continueFight(gladiators.filter(g => g.health > 0));
}

async function fight(gladiator, gladiators) {
  while (true) {
    const dead = gladiators.filter(g => g.health <= 0);
    if (dead.length > 0) {
      break;
    }
    if (gladiators.length === 1) {
      if (gladiators[0] === gladiator) {
        console.log(`${gladiator.name} won the battle with health ${gladiator.health.toFixed(1)}`);
      }
      break;
    }
    const opponent = getAnotherGladiator(gladiators, gladiator);
    gladiator.dealDamage(opponent);
    console.log(`${gladiator.name} hits ${opponent.name} with power ${gladiator.power}`);
    if (opponent.health <= 0) {
      return new Promise((resolve, reject) => {
        involveCaesar(opponent);
        console.log(`${opponent.name} dying`);
        resolve(true);
      });
    }
    await new Promise(resolve => setTimeout(resolve, getMillisecondsFromSpeed(gladiator.getSpeed())));
  }
}

generateGladiators();