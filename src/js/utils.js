import {OfferStatus} from './const.js';

export const parseTriads = (str) => {
  return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '&nbsp;');
};


export const DateMode = {
  HUMAN: 'HUMAN',
  ISO: 'ISO',
}

export const getDateByTimestamp = (timestamp, dateMode = DateMode.HUMAN) => {
  const date = new Date(timestamp * 1000);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  switch (dateMode) {
    case DateMode.HUMAN:
      return `${day}.${month}.${date.getFullYear()}`;
    case DateMode.ISO:
      return date.toISOString();
  }
}


export const getOfferStatus = (timestamp) => {
  let nowTimestamp = new Date;

  const offerTimestamp = new Date(timestamp * 1000);
  const diff = offerTimestamp.getDate() - nowTimestamp.getDate();

  if (diff > 0) {
    return OfferStatus.FUTURE;
  } else if (diff < 0) {
    return OfferStatus.PAST;
  } else {
    return OfferStatus.PRESENT;
  }
}


export const AlertMode = {
  GOOD: 'GOOD',
  BAD: 'BAD',
}

const AlertStyle = {
  padding: '10px',

  fontWeight: '700',
  color: '#FFFFFF',
  textAlign: 'center',

  width: '100%',
  position: 'fixed',
  top: '0',
  left: '0',
  zIndex: '50',
}

export const showAlert = (text, mode = AlertMode.BAD) => {
  const alert = document.createElement('div');

  alert.textContent = text;

  for (let property in AlertStyle) {
    alert.style[property] = AlertStyle[property];
  }

  switch(mode) {
    case AlertMode.BAD:
      alert.style.backgroundColor = 'var(--error)';
      break;
    case AlertMode.GOOD:
      alert.style.backgroundColor = 'var(--success)';
      break;
  }

  const timeoutId = setTimeout(() => alert.remove(), 3000);

  alert.addEventListener('click', () => {
    alert.remove();

    clearTimeout(timeoutId);
  }, { once: true });

  document.body.append(alert);
}
