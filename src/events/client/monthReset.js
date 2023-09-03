module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const { CronJob } = require('cron');
    const { User } = require('../../schemas/user');

    const resetMonthlyPoints = async () => {
      try {
        const today = new Date();
        const currentMonth = today.getMonth();
        
        // Set the date to the last day of the previous month
        today.setMonth(currentMonth - 1);
        today.setDate(0);
        
        const previousMonth = today.toLocaleString('default', { month: 'long' });

        await User.updateMany({}, { monthlyPoints: 0, monthlyResetMonth: currentMonth });
        
        // Send message to channel informing monthly points have been reset
        const channel = client.channels.cache.get('1094916787918868520');
        channel.send(`The monthly points for ${previousMonth} were reset for all ally members.`);
      } catch (error) {
        console.error(error);
      }
    };

    const job = new CronJob('0 0 1 * *', resetMonthlyPoints, null, true, 'Europe/Paris');
    job.start();
  },
};
