import {DateMode, getDateByTimestamp, getOfferStatus, parseTriads, showAlert} from './utils.js';
import {OfferStatusLabel} from './const.js';

export default class Offers {
  #offersApiService = null;
  #timeoutLoad = 0;
  #offers = [];

  #offersTableNode = document.querySelector('.offers__table');
  #selectOrderNode = document.querySelector('.select-offer');

  constructor({offersApiService, timeoutLoad}) {
    this.#offersApiService = offersApiService;
    this.#timeoutLoad = timeoutLoad;
  }

  async init() {
    await this.#loadOffers();

    this.#addOffersClickHandler();
    this.#addSelectOrderClickHandler();
  }

  // получение данных

  async #loadOffers(page = 1) {
    try {
      const offersData = await this.#offersApiService.getOffers({
        page,
      });

      this.#offers.push(...this.#adaptToClient(offersData));

      const nextPage = this.#getNextOfferPage(offersData);

      if (nextPage) {
        setTimeout(() => this.#loadOffers(nextPage), this.#timeoutLoad)
      } else {
        this.#renderTable();
      }
    } catch(err) {
      this.#offers = [];

      showAlert('Ошибка при получении сделок. Обновите страницу');
    }
  }

  async #loadOneOffer(id) {
    try {
      const offerData = await this.#offersApiService.getOneOffer({
        id,
      });

      this.#renderSelectOrder(offerData);
      this.#hideSelectOrderLoading();
    } catch(err) {
      this.#resetSelectOrder();

      showAlert('Ошибка при получении сделки. Обновите страницу');
    }
  }

  // рендрер элементов

  #renderTable() {
    this.#offersTableNode.innerHTML = this.#createTableHead() + this.#offers.map(this.#renderOffer).join('');

    document.body.classList.remove('page--loading');
  }

  #renderOffer(offer, index) {
    return `<tr data-offer-id="${offer.id}">
      <td>${index + 1}</td>
      <td>${offer.name}</td>
      <td>${parseTriads(offer.price) + '&nbsp;$'}</td>
      <td>${offer.id}</td>
    </tr>`;
  }

  #createTableHead() {
    return `<tr>
      <th>#</th>
      <th>Название</th>
      <th>Бюджет</th>
      <th>ID</th>
    </tr>`;
}

  #renderSelectOrder(data) {
    this.#selectOrderNode.classList.add('select-offer--active');

    const selectOrderContentNode = this.#selectOrderNode.querySelector('.select-offer__content');

    const offerStatus = getOfferStatus(data.closest_task_at);
    const offerStatusLabel = OfferStatusLabel[offerStatus];

    selectOrderContentNode.innerHTML = `<h2 class="select-offer__title">
      ${data.name}
    </h2>

    <dl class="select-offer__data">
      <div>
        <dt>ID</dt>
        <dd>${data.id}</dd>
      </div>
      <div>
        <dt>Дата</dt>
        <dd>
          <time datetime="${getDateByTimestamp(data.closest_task_at, DateMode.ISO)}">
            ${getDateByTimestamp(data.closest_task_at)}
          </time>
        </dd>
      </div>
      <div>
        <dt>Статус</dt>
        <dd>
          <svg data-status="${offerStatus}" width="16" height="16" fill="currentColor" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <span class="select-offer__data-status-label">
            ${offerStatusLabel}
          </span>
        </dd>
      </div>
    </dl>`;
  }

  // вспомогательные функции для рендера

  #activeOfferRow(offerRow) {
    this.#disableActiveOfferRows();

    offerRow.classList.add('active');
  }

  #disableActiveOfferRows() {
    const activeTabNode = this.#offersTableNode.querySelector('.active');
    activeTabNode && activeTabNode.classList.remove('active');
  }

  #showSelectOrderLoading() {
    this.#selectOrderNode.classList.add('select-offer--loading');
  }

  #resetSelectOrder() {
    this.#selectOrderNode.classList.remove('select-offer--active');
    this.#selectOrderNode.classList.remove('select-offer--loading');
  }

  #hideSelectOrderLoading() {
    this.#selectOrderNode.classList.remove('select-offer--loading');
  }

  // обработчики событий

  #addOffersClickHandler() {
    this.#offersTableNode.addEventListener('click', (event) => {
      const offerNode = event.target.closest('td');

      if (!offerNode) {
        // если клик произошел не по строке таблицы со сделкой — выходим из обработчика
        return;
      }

      this.#showSelectOrderLoading();

      const offerRow = offerNode.closest('tr');

      const id = offerRow.dataset.offerId;

      this.#loadOneOffer(id)
        .then(() => this.#activeOfferRow(offerRow));
    })
  }

  #addSelectOrderClickHandler() {
    this.#selectOrderNode.addEventListener('click', (event) => {
      const offerContentNode = event.target.closest('.select-offer__content');

      if (offerContentNode) {
        // если клик произошел по контнету — выходим из обработчика
        return;
      }

      this.#selectOrderNode.classList.remove('select-offer--active');
      this.#disableActiveOfferRows();
    });
  }

  // обработка полученных данных

  #adaptToClient(offersData) {
    return offersData._embedded.leads;
  }

  #getNextOfferPage(offersData) {
    return offersData._links.next ? offersData._page + 1 : null;
  }
}
