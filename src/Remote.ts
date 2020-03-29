import net from 'net';

export enum Keys {
  Red = 'TR_KEY_RED',
  Green = 'TR_KEY_GREEN',
  Yellow = 'TR_KEY_YELLOW',
  Blue = 'TR_KEY_BLUE',
  Input = 'TR_KEY_INPUT',
  Tuner = 'TR_KEY_TUNER',
  VolumeUp = 'TR_KEY_VOL_UP',
  ChannelUp = 'TR_KEY_CH_UP',
  Mute = 'TR_KEY_MUTE',
  VolumeDown = 'TR_KEY_VOL_DOWN',
  ChannelDown = 'TR_KEY_CH_DOWN',
  ChannelList = 'TR_KEY_LIST',
  SmartTV = 'TR_KEY_SMARTTV',
  Guide = 'TR_KEY_GUIDE',
  MainMenu = 'TR_KEY_MAINMENU',
  Up = 'TR_KEY_UP',
  InfoWindow = 'TR_KEY_INFOWINDOW',
  Left = 'TR_KEY_LEFT',
  Ok = 'TR_KEY_OK',
  Right = 'TR_KEY_RIGHT',
  Back = 'TR_KEY_BACK',
  Down = 'TR_KEY_DOWN',
  Exit = 'TR_KEY_EXIT',
  One = 'TR_KEY_1',
  Two = 'TR_KEY_2',
  Three = 'TR_KEY_3',
  Four = 'TR_KEY_4',
  Five = 'TR_KEY_5',
  Six = 'TR_KEY_6',
  Seven = 'TR_KEY_7',
  Eight = 'TR_KEY_8',
  Nine = 'TR_KEY_9',
  Zero = 'TR_KEY_0',
  Favorite = 'TR_KEY_FAVORITE',
  Youtube = 'TR_KEY_YOUTUBE',
  Netflix = 'TR_KEY_APP',
  AT = 'TR_KEY_AT',
  App = 'TR_KEY_APP',
  Picture = 'TR_KEY_PICTURE',
  Sound = 'TR_KEY_SOUND',
  Mts = 'TR_KEY_MTS',
  CC = 'TR_KEY_CC',
  Usb = 'TR_KEY_USB',
  Option = 'TR_KEY_OPTION',
  Sleep = 'TR_KEY_SLEEP',
  ThreeD = 'TR_KEY_3D',
  Rew = 'TR_KEY_REW',
  PlayPause = 'TR_KEY_PLAYPAUSE',
  FF = 'TR_KEY_FF',
  Previous = 'TR_KEY_PREVIOUS',
  Suspend = 'TR_KEY_SUSPEND',
  Next = 'TR_KEY_NEXT',
  Aircable = 'TR_KEY_AIRCABLE',
  Home = 'TR_KEY_HOME',
  Search = 'TR_KEY_SEARCH',
  I = 'TR_KEY_I',
  REC = 'TR_KEY_REC',
  TV = 'TR_KEY_TV',
  Amazon = 'TR_KEY_AMAZON',
  Vudu = 'TR_KEY_VUDU',
  MGO = 'TR_KEY_MGO',
  ZoomDown = 'TR_KEY_ZOOM_DOWN', // Screen More
  ZoomUp = 'TR_KEY_ZOOM_UP', // Screen More
  SleepDown = 'TR_KEY_SLEEP_DOWN',
  SleepUp = 'TR_KEY_SLEEP_UP',
  Media = 'TR_KEY_MEDIA',
  Source = 'TR_KEY_SOURCE',
  TextTV = 'TR_KEY_TEXT',
  Play = 'TR_KEY_PLAY',
  Pause = 'TR_KEY_PAUSE',
  Format = 'TR_KEY_FORMAT',
  Scale = 'TR_KEY_SCALE',
  PreviousChannel = 'TR_KEY_PRE_CH',
  Freeze = 'TR_KEY_FREEZE',
  EPG = 'TR_KEY_EPG',
  Subtitle = 'TR_KEY_SUBTITLE',
  Display = 'TR_KEY_DISPLAY',
  Language = 'TR_KEY_LANG',
  Appstore = 'TR_KEY_APPSTORE',
  All = 'TR_KEY_ALLAPP',
  EnergySaving = 'TR_KEY_ECO',
  Power = 'TR_KEY_POWER',
}

class Remote {
  protected host: string;
  protected port = 4123;
  protected ready?: Promise<Remote>;
  protected socket?: net.Socket;
  protected interval?: ReturnType<typeof setInterval>;

  constructor(host: string, port?: number) {
    this.host = host;

    if (port) this.port = port;
  }

  public init(): Promise<Remote> {
    if (!this.ready) {
      this.ready = new Promise<Remote>((rs, rj): void => {
        try {
          this.socket = net.createConnection(this.port, this.host, () => {
            this.interval = setInterval(() => this.ping(), 30000);
            rs(this);
          });
        } catch (error) {
          rj(error);
        }
      });
    }

    return this.ready;
  }

  protected async write(data: string): Promise<void> {
    await this.init();

    return new Promise((rs): void => {
      this.socket!.write(data, 'utf8', () => {
        rs();
      });
    });
  }

  public async ping(): Promise<void> {
    return this.write('noop');
  }

  public send(code: string): Promise<void> {
    const data = `<?xml version="1.0" encoding="utf-8"?><root><action name="setKey" eventAction="TR_DOWN" keyCode="${code}" /></root>`;
    return this.write(data);
  }

  public press(key: Keys): Promise<void> {
    return this.send(key);
  }

  public close() {
    if (this.interval) clearInterval(this.interval);
    if (this.socket) this.socket.destroy();
  }
}

export default Remote;
