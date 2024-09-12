import AmoCrmApiService from './api.js';
import Offers from './offers.js';
import {showAlert} from './utils.js';
import {BEARER_TOKEN, END_POINT, MAX_LOADING_OFFERS, TIMOUT_LOAD} from './const.js';

const offersApiService = new AmoCrmApiService({
  endPoint: END_POINT,
  bearerToken: BEARER_TOKEN,
  loadLimit: MAX_LOADING_OFFERS,
})

const offers = new Offers({
  offersApiService,
  timeoutLoad: TIMOUT_LOAD,
});

offers.init()
  .catch((error) => {
    showAlert('Ошибка при загрузке. Обновите страницу');

    throw error;
  });
