export default class AmoCrmApiService {
  #endPoint;
  #bearerToken;
  #loadLimit;

  constructor({endPoint, bearerToken, loadLimit}) {
    this.#endPoint = endPoint;
    this.#bearerToken = bearerToken;
    this.#loadLimit = loadLimit;
  }

  getOffers({
    page = 1,
  }) {
    return this.#load({
      url: 'leads',
      params: {
        limit: this.#loadLimit,
        page,
      }
    })
      .then(this.#parseResponse);
  }

  getOneOffer({
    id
  }) {
    return this.#load({
      url: `leads/${id}`,
    })
      .then(this.#parseResponse);
  }

  async #load({
    url,
    method = 'GET',
    body = null,
    headers = new Headers(),
    params = {},
  }) {
    headers.append('Authorization', `Bearer ${this.#bearerToken}`);

    const urlObject = new URL(`${this.#endPoint}/${url}`);
    const urlParams = new URLSearchParams(params);

    urlObject.search = urlParams.toString();

    const mode = 'no-cors';

    const response = await fetch(
      urlObject,
      {method, body, headers, mode},
    );

    try {
      this.#checkStatus(response);
      return response;
    } catch (err) {
      this.#catchError(err);
    }
  }

  #parseResponse(response) {
    return response.json();
  }

  #checkStatus(response) {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  }

  #catchError(err) {
    throw err;
  }
}
