import http from 'http';

export interface DeviceProperties {
  location: string;
  friendlyName?: string;
  manufacturer?: string;
  modelName?: string;
}

const Props: Record<keyof Omit<DeviceProperties, 'location'>, RegExp> = {
  friendlyName: /<friendlyName>([^<]+)<\/friendlyName>/i,
  manufacturer: /<manufacturer>([^<]+)<\/manufacturer>/i,
  modelName: /<modelName>([^<]+)<\/modelName>/i,
};

class Device {
  protected location: string;
  protected fetching?: Promise<DeviceProperties>;

  public constructor(location: string) {
    this.location = location;
  }

  public async fetch(): Promise<DeviceProperties> {
    if (!this.fetching) {
      this.fetching = new Promise<DeviceProperties>((rs, rj): void => {
        http.get(this.location, (res): void => {
          const { statusCode } = res;

          if (statusCode !== 200) {
            res.resume();
            rj(new Error(`Failed to get location: ${this.location}`));
            return;
          }

          res.setEncoding('utf-8');

          let data = '';

          res.on('data', (chunk): void => {
            data += chunk;
          });

          res.on('end', () => {
            const props: DeviceProperties = {
              location: this.location,
            };

            for (const [key, regexp] of Object.entries(Props)) {
              const match = data.match(regexp);

              if (match) props[key as keyof typeof Props] = match[1];
            }

            rs(props);
          });
        });
      });
    }

    return this.fetching;
  }
}

export default Device;
