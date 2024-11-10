// many parts of this file are copied form audiobridge example in janode

import AudioBridgePlugin from 'janode/plugins/audiobridge';
import Janode from 'janode';
const { Logger } = Janode;

const config = {
  is_admin: false,
  address: {
    url: 'ws://localhost:8188/',
    apisecret: 'secret'
  }
};

const scheduleServiceConnection = (function () {
  let task = null;

  return (function (del = 10) {
    if (task) return;
    console.log(`scheduled connection in ${del} seconds`);
    task = setTimeout(() => {
      initService()
        .then(() => task = null)
        .catch(() => {
          task = null;
          scheduleServiceConnection();
        });
    }, del * 1000);
  });
})();

export async function initService() {
  console.log('connecting Janode to Janus')
  let connection;
  let session;
  let pluginHandle;

  try {
    connection = await Janode.connect(config);
    console.log('Janus connection created');

    connection.once(Janode.EVENT.CONNECTION_CLOSED, () => {
      Logger.info('Janus connection closed');
    });

    connection.once(Janode.EVENT.CONNECTION_ERROR, ({ message }) => {
      console.error('Janus connection error', message);
      scheduleServiceConnection();
    });

    const session = await connection.create();
    console.log('Janus session created');
    session = session;

    session.once(Janode.EVENT.SESSION_DESTROYED, () => {
      Logger.info('Janus session destroyed');
      session = null;
    });

    const handle = await session.attach(AudioBridgePlugin);
    console.log('manager handle attached');
    pluginHandle = handle;

    // generic handle events
    handle.once(Janode.EVENT.HANDLE_DETACHED, () => {
      console.log('manager handle detached');
    });
  } catch (error) {
    console.error('Janode setup error', error);
    if (connection) connection.close().catch(() => { });
    throw error;
  }

  return new AudioBridgeService(session, pluginHandle);
}

export class AudioBridgeService
{
  #session;
  #pluginHandle; // upper-level handle, persisted
  #audioHandle; // lower-level handle, destroyed and created per join
  #peerConnection;

  constructor(session, pluginHandle)
  {
    this.session = session;
    this.pluginHandle = pluginHandle;
  }

  destroySession()
  {
    if (this.session)
      this.session.destroy();
  }

  async join({ room, display = this.getId(), muted = false, suspended = false, token = null, rtp_participant = null, group = null } = {}, pcOnTrackCallback) {
    const joinData = {
      room,
      display,
      muted,
      suspended,
      token,
      rtp_participant,
      group,
    };

    console.log('Attempting to join room', room);
    if (!this.checkSession(this.pluginHandle)) return;

    if (this.audioHandle) {
      console.log('Detaching from previous handle');
      this.audioHandle.detach().catch(() => { });
    }

    let response;

    try {
      this.audioHandle = await this.session.attach(AudioBridgePlugin);
      console.log('Plugin handle attached');

      // custom audiobridge events
      this.audioHandle.once(AudioBridgePlugin.EVENT.AUDIOBRIDGE_DESTROYED, eventdata => {
        this.closePC();
        this.audioHandle.detach().catch(error => { console.error('Error on detatch', error) });
        console.log('Destroyed', eventdata)
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_PEER_JOINED, eventdata => {
        console.log('Peer joined', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_PEER_LEAVING, eventdata => {
        console.log('Peer leaving', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_CONFIGURED, eventdata => {
        console.log('Room re-configured', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_PEER_CONFIGURED, eventdata => {
        console.log('Peer configured', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_KICKED, eventdata => {
        this.audioHandle.detach().catch(error => { console.error('Error on detach when kicked', error) });
        console.log('User was kicked', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_PEER_KICKED, eventdata => {
        console.log('Peer was kicked', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_TALKING, eventdata => {
        console.log('User talking', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_PEER_TALKING, eventdata => {
        console.log('Peer talking', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_ROOM_MUTED, eventdata => {
        console.log('Room muted', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_PEER_SUSPENDED, eventdata => {
        console.log('Peer suspended', eventdata);
      });

      this.audioHandle.on(AudioBridgePlugin.EVENT.AUDIOBRIDGE_PEER_RESUMED, eventdata => {
        console.log('Peer resumed', eventdata);
      });

      // generic audiobridge events
      this.audioHandle.on(Janode.EVENT.HANDLE_WEBRTCUP, () => console.log('Webrtcup event'));
      this.audioHandle.on(Janode.EVENT.HANDLE_MEDIA, eventdata => console.log('Media event', eventdata));
      this.audioHandle.on(Janode.EVENT.HANDLE_SLOWLINK, eventdata => console.log('Slowlink event', eventdata));
      this.audioHandle.on(Janode.EVENT.HANDLE_HANGUP, eventdata => console.log('Hangup event', eventdata));
      this.audioHandle.once(Janode.EVENT.HANDLE_DETACHED, () => console.log('Handle detached'));
      this.audioHandle.on(Janode.EVENT.HANDLE_TRICKLE, eventdata => console.log('Trickle event', eventdata));

      response = await this.audioHandle.join(joinData);
      console.log('Joined room', response);
    } catch (error) {
      console.error('Join room error', error);
      if (this.audioHandle) this.audioHandle.detach().catch(error => { console.error('Error detaching', error) });
    }

    console.log('Attempting offer & configure');
    this.closePC();
    try {
      const offer = await this.doOffer(response.feed, pcOnTrackCallback);
      this.configure({ jsep: offer });
      console.log('Offer & configure success');
    } catch (error) {
      console.log('Error offer & configure', error);
      this.closePC();
      return null;
    }

    return this.peerConnection;
  }

  async configure({ display, muted, record, filename, bitrate, expected_loss, group, jsep }) {
    console.log('Attempting configure');
    if (!this.checkSession(this.audioHandle)) return;

    const configureData = {};
    const configureId = this.getId();
    if (display) configureData.display = display;
    if (typeof muted === 'boolean') configureData.muted = muted;
    if (typeof record === 'boolean') configureData.record = record;
    if (filename) configureData.filename = filename;
    if (typeof bitrate === 'number') configureData.bitrate = bitrate;
    if (typeof expected_loss === 'number') configureData.expected_loss = expected_loss;
    if (group) configureData.group = group;
    if (jsep) configureData.jsep = jsep;

    try {
      const response = await this.audioHandle.configure(configureData);
      console.log('Configure success');
      if (this.peerConnection && response.jsep) {
        this.peerConnection.setRemoteDescription(response.jsep)
          .then(() => console.log('PeerConnection set remote SDP'))
          .catch(e => console.error('PeerConnection error setting remote SDP'));
      }
    } catch (error) {
      console.error('Error on configure', error);
    }
  }

  async hangup() {
    console.log('Attempting hangup');
    if (!this.checkSession(this.audioHandle)) return;
    try {
      const response = await this.audioHandle.hangup();
      console.log('Hangup success');
    } catch (error) {
      console.error('Error on hangup', error);
    }
  }

  async leave() {
    console.log('Attempting leave');
    if (!this.checkSession(this.audioHandle)) return;
    try {
      const response = await this.audioHandle.leave();
      console.log('Leave success');
      this.closePC();
      this.audioHandle.detach().catch(error => { console.error('Error on detatch', error) });
    } catch (error) {
      console.error('Error on leave', error);
    }
  }

  disconnect() {
    console.log('Attempting disconnect');
    this.audioHandle.detach().catch(error => { console.error('Error on detatch', error) });
    console.log('Disconnect success');
  }

  async listParticipants() {
    console.log('Attempting list-participants');
    if (!this.checkSession(this.pluginHandle)) return;
    let response;
    try {
      response = await this.pluginHandle.listParticipants();
    } catch (error) {
      console.error('Error on list-participants', error);
    }
    return response.getPlainMessage().plugindata.data.participants;
  }

 async listRooms() {
    console.log('Attempting list-rooms');
    if (!this.checkSession(this.pluginHandle)) return;
    let response;
    try {
      response = await this.pluginHandle.listRooms();
    } catch (error) {
      console.error('Error on list-rooms', error);
    }
    return response.getPlainMessage().plugindata.data.rooms;
  }

  async create({ room, description, permanent = false, pin = null, secret = null, allow_rtp = true, bitrate = 0, expected_loss = 0, talking_events = false, talking_level_threshold = 25, talking_packets_threshold = 100, groups } = {}) {
    console.log('Attempting create');
    if (!this.checkSession(this.pluginHandle)) return;
    try {
      const response = await this.pluginHandle.create({
        room,
        description,
        permanent,
        allow_rtp,
        bitrate,
        expected_loss,
        talking_events,
        talking_level_threshold,
        talking_packets_threshold,
        groups,
        pin,
        secret
      });
      console.log(response);
    } catch (error) {
      console.error('Error on create', error);
    }
  }

  async destroy({ room, permanent = false, secret = 'adminpwd' } = {}) {
    console.log('Attempting destroy');
    if (!this.checkSession(this.pluginHandle)) return;
    try {
      const response = await this.pluginHandle.destroy({
        room,
        permanent,
        secret
      });
      console.log(response);
    } catch (error) {
      console.error('Error on destroy', error);
    }
  }

  #checkSession(handle) {
    if (!this.session) {
      console.error('Session doesn\'t exist');
      return false;
    }
    if (!handle) {
      console.error('Audio handle doesn\'t exist');
      return false;
    }
    return true;
  }

  #closePC(pc = this.peerConnection) {
    if (!pc) return;
    pc.getSenders().forEach(sender => {
      if (sender.track)
        sender.track.stop();
    });
    pc.getReceivers().forEach(receiver => {
      if (receiver.track)
        receiver.track.stop();
    });
    pc.onnegotiationneeded = null;
    pc.onicecandidate = null;
    pc.oniceconnectionstatechange = null;
    pc.ontrack = null;
    pc.close();
    if (pc === this.peerConnection) this.peerConnection = null;
  }

  async #doOffer(feed, pcOnTrackCallback) {
    if (!this.peerConnection) {
      const pc = new RTCPeerConnection({
        'iceServers': [],
      });

      this.peerConnection = pc;

      pc.onnegotiationneeded = event => console.log('pc.onnegotiationneeded', event);
      // pc.onicecandidate = event => trickle({ candidate: event.candidate });
      // pc.oniceconnectionstatechange = () => {
      //   if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
      //     closePC(pc);
      //   }
      // };
      pc.ontrack = pcOnTrackCallback;
      // pc.ontrack = event => {
      //   console.log('pc.ontrack', event);

      //   event.track.onunmute = evt => {
      //     console.log('track.onunmute', evt);
      //     /* TODO set srcObject in this callback */
      //   };
      //   event.track.onmute = evt => {
      //     console.log('track.onmute', evt);
      //   };
      //   event.track.onended = evt => {
      //     console.log('track.onended', evt);
      //   };

      //   const remoteStream = event.streams[0];
      // };

      // const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      // console.log('Got user media');

      // localStream.getTracks().forEach(track => {
      //   console.log('adding track', track);
      //   pc.addTrack(track, localStream);
      // });
    }

    const offer = await this.peerConnection.createOffer();
    console.log('PeerConnection create offer OK');
    await this.peerConnection.setLocalDescription(offer);
    console.log('PeerConnection set local SDP OK');
    return offer;
  }

  #getId() {
    return Math.floor(Number.MAX_SAFE_INTEGER * Math.random());
  }
}