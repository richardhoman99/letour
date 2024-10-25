import Janus from 'janus-gateway-js';

// Create a Janus client instance
const janus = new Janus.Client('ws://localhost:8188/janus', {
  keepalive: true
});

export const initJanusSession = async () => {
  try {
    // Create a new session
    const connection = await janus.createConnection();
	const session = await connection.createSession();
    
    console.log('Janus session established:', session);

    // Create a plugin handle (e.g., for Video Room or Audiobridge)
    const plugin = await session.attachPlugin('janus.plugin.audiobridge');
    
    console.log('Plugin attached:', plugin);

    return { session, plugin };
  } catch (err) {
    console.error('Error initializing Janus session:', err);
  }
};