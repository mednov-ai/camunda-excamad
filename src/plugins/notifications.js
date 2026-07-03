export default {
  install(app) {
    app.config.globalProperties.$notify = message => {
      if (typeof message === 'string') {
        console.info(message);
      } else if (message?.text || message?.title) {
        console.info([message.title, message.text].filter(Boolean).join(': '));
      }
    };
  }
};
