import dgram from 'dgram';
import { EventEmitter } from 'events';
import Deferred from './Deferred';

const Ssdp = {
  ip: '239.255.255.250',
  port: 1900,
  delimiter: '\r\n',
};

const LocationRegexp = /^Location: ?(.*)$/i;

type Location = string;
type DeferredLocation = Deferred<Location, Error>;

class Finder extends EventEmitter {
  protected ready?: Promise<Finder>;
  protected socket?: dgram.Socket;
  protected finder?: DeferredLocation;

  protected init(): Promise<Finder> {
    if (!this.ready) {
      this.ready = new Promise<Finder>((rs, rj): void => {
        try {
          const socket = (this.socket = dgram.createSocket({
            type: 'udp4',
            reuseAddr: true,
          }));
          socket.on('message', (msg): void => this.handleMessage(msg));
          socket.bind(Ssdp.port, () => {
            socket.addMembership(Ssdp.ip);
            socket.setMulticastTTL(4);
            rs(this);
          });
        } catch (error) {
          rj(error);
        }
      });
    }
    return this.ready;
  }

  protected getFinder(): DeferredLocation {
    if (!this.finder) this.finder = new Deferred<Location, Error>();

    return this.finder;
  }

  public async find(): Promise<Location> {
    await this.init();

    const finder = this.getFinder();
    // const message = Buffer.from('M-SEARCH * HTTP/1.1\r\nHOST:239.255.255.250:1900\r\nST:upnp:rootdevice\r\nMAN:ssdp:discover\r\nMX:2\r\n\r\n', 'utf-8');
    const message = Buffer.from(
      [
        'M-SEARCH * HTTP/1.1',
        `HOST: ${Ssdp.ip}:${Ssdp.port}`,
        'MAN: "ssdp:discover"',
        'MX: 2',
        'ST: upnp:rootdevice',
        Ssdp.delimiter,
      ].join(Ssdp.delimiter),
      'ascii'
    );
    this.socket!.send(message, Ssdp.port, Ssdp.ip);

    return finder.promise;
  }

  public close() {
    const finder = this.getFinder();
    finder.reject(new Error('Finder being closed'));

    return new Promise((rs, rj) => {
      if (!this.socket) {
        rj();
        return;
      }

      this.socket.close(rs);
    });
  }

  protected handleMessage(msg: Buffer): void {
    const text = msg.toString();
    const [, ...rest] = text.split(Ssdp.delimiter);

    let location;
    for (const str of rest) {
      const match = str.match(LocationRegexp);

      if (match) {
        location = match[1];
        break;
      }
    }

    if (!location) return;
    if (!location.endsWith('/mstar')) return;
    const finder = this.getFinder();

    this.emit('found', location);
    finder.resolve(location);
  }
}

export default Finder;
