/* eslint-disable no-alert */
/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  const counter = document.querySelector('#coffee_counter');
  counter.innerText = coffeeQty;
}

function clickCoffee(data) {
  data.coffee++;
  updateCoffeeView(data.coffee);
  renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  producers.forEach( producer => {
    if (producer.price/2 <= coffeeCount) {
      producer.unlocked = true;
    }
  } )
}

function getUnlockedProducers(data) {
  return data.producers.filter( producer => producer.unlocked );
}

function makeDisplayNameFromId(id) {
  return id.split('_')
           .map( part => part.charAt(0).toUpperCase() + part.slice(1) )
           .join(' ');
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement('div');
  containerDiv.className = 'producer';
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <div class='buttons'>
      <button type="button" id="buy_${producer.id}">Buy</button>
      <button type="button" class='buy-all' id="buy_${producer.id}">Buy All</button>
      <button type="button" class='sell-all' id="buy_${producer.id}">Sell All</button>
    </div>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while (parent.firstChild) parent.removeChild(parent.firstChild);
}

function renderProducers(data) {
  const container = document.querySelector('#producer_container');
  unlockProducers(data.producers, data.coffee);
  const unlocked = getUnlockedProducers(data);
  deleteAllChildNodes(container);
  unlocked.forEach( producer => {
    const newNode = makeProducerDiv(producer);
    container.appendChild(newNode);
  })
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  return data.producers.filter( producer => producer.id === producerId)[0];
}

function canAffordProducer(data, producerId) {
  return getProducerById(data, producerId).price <= data.coffee;
}

function updateCPSView(cps) {
  document.querySelector('#cps').innerText = cps;
}

function updateRefund(oldRefund) {
  return Math.floor(oldRefund * 0.2);
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice * 1.25);
}

function attemptToBuyProducer(data, producerId) {
  let canAfford = false;

  if (canAffordProducer(data, producerId)) {
    canAfford = true;
    let producer = getProducerById(data, producerId);
    producer.qty++;
    data.coffee -= producer.price;
    producer.refund += updateRefund(producer.price);
    producer.price = updatePrice(producer.price);
    data.totalCPS += producer.cps;
    updateCPSView(data.totalCPS);
  }

  return canAfford;
}

function buyAll(data, producer) {
  while (canAffordProducer(data, producer)) {
    attemptToBuyProducer(data, producer)
  }
}

function sellAll(data, producerId) {
  console.log('got here');
  const producer = getProducerById(data, producerId);
  data.coffee += producer.refund;
  producer.price = producer.startPrice;
  producer.qty = 0;
}

function buyButtonClick(event, data) {
  const target = event.target;
  if (target.tagName === 'BUTTON') {
    const producer = target.id.slice(4);
    if (target.className === 'buy-all') {
      buyAll(data, producer);
    } else if (target.className === 'sell-all') {
      sellAll(data, producer);
    } else {
      const valid = attemptToBuyProducer(data, producer);
      if (!valid) {
        window.alert('Not enough coffee!');
      } else {
        renderProducers(data);
        updateCoffeeView(data.coffee);
        updateCPSView(data.totalCPS);
      }
    }
  }
}

function tick(data) {
  data.coffee += data.totalCPS;
  updateCoffeeView(data.coffee);
  updateCPSView(data.totalCPS);
  renderProducers(data);
}

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === 'undefined') {
  // Get starting data from the window object
  // (This comes from data.js)

  window.localStorage.clear();
  if (window.localStorage.getItem('data')) {
    window.data = JSON.parse( window.localStorage.getItem('data') );
  }
  const data = window.data;

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById('big_coffee');
  bigCoffee.addEventListener('click', () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById('producer_container');
  producerContainer.addEventListener('click', event => {
    buyButtonClick(event, data);
  });

  // Call the tick function passing in the data object once per second
  setInterval(() =>{ 
    tick(data);
    window.localStorage.setItem('data', JSON.stringify(data));
  }, 1000);
}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {

  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick
  };
}