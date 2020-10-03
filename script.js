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
  const n = faker.random.number({ min: 2, max: 40 });
  faker.locale = "az";
  let i = 0;
  while (i < n) {
    gladiators.push(
      new Gladiator(
        faker.name.findName(),
        faker.random.number({ min: 80, max: 100 }),
        faker.random.number({ min: 20, max: 50 }) / 10,
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

const addToContainer = (attackerName, opponentName, attackPower) => {
  const container = document.getElementById('data-container');
  const html = `<div class="data-card">
                  <span class="highlight">${attackerName}</span> hits <span class="highlight">${opponentName}</span> with power <span class="highlight">${attackPower}</span>
                </div>`;
  container.innerHTML = html + container.innerHTML;
  if (container.childElementCount > 40) {
    container.lastChild.remove();
  }
  console.log(`${attackerName} hits ${opponentName} with power ${attackPower}`);
}

const showNotification = (text) => {
  const notifications = document.getElementById('notifications');
  const html = `<div class="notification-card">${text}</div>`;
  notifications.innerHTML = html + notifications.innerHTML;
  if (notifications.childElementCount > 10) {
    notifications.lastChild.remove();
  }
  console.log(text);
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

const start = () => {
  document.getElementById('start-btn').style = 'display: none;';
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
  showNotification(`Caesar showed 👎 to ${gladiator.name}`);
  continueFight(gladiators.filter(g => g.health > 0));
}

const caesarLive = (gladiator) => {
  showNotification(`Caesar showed 👍 to ${gladiator.name}`);
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
        showNotification(`${gladiator.name} won the battle with health ${gladiator.health.toFixed(1)}`);
      }
      break;
    }
    const opponent = getAnotherGladiator(gladiators, gladiator);
    gladiator.dealDamage(opponent);
    addToContainer(gladiator.name, opponent.name, gladiator.power);
    if (opponent.health <= 0) {
      return new Promise((resolve, reject) => {
        involveCaesar(opponent);
        showNotification(`${opponent.name} dying`);
        resolve(true);
      });
    }
    await new Promise(resolve => setTimeout(resolve, getMillisecondsFromSpeed(gladiator.getSpeed())));
  }
}

generateGladiators();