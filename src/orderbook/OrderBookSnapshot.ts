interface params {
  symbol?: string;
  endpoint?: string;
  depth?: number;
}

class OrderBookSnapshot {
  private DEPTH = 5000;
  private DEFAULT_SYMBOL = 'BTCUSDT';
  private ENDPOINT = 'https://api.binance.com/api/v3/depth';
  private url: string;

  constructor({ symbol, endpoint, depth }: params = {}) {
    symbol = symbol ?? this.DEFAULT_SYMBOL;
    endpoint = endpoint ?? this.ENDPOINT;
    depth = depth ?? this.DEPTH;
    this.url = `${endpoint}?symbol=${symbol}&limit=${depth}`;
  }

  async get() {
    const response = await fetch(this.url);
    return response.json();
  }
}

export default OrderBookSnapshot;
