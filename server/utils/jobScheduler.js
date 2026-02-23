import cron from 'node-cron';
import User from '../models/User.js';
import JobListing from '../models/JobListing.js';
import { sendJobDigestEmail } from './emailService.js';

let schedulerStarted = false;

/**
 * Initialize the daily job digest scheduler
 * Runs every day at 9 AM (can be customized)
 */
export async function initializeJobScheduler() {
  if (schedulerStarted) {
    console.log('⏰ Job scheduler already running');
    return;
  }

  // Run every day at 9:00 AM
  // Format: "0 9 * * *" = at 09:00 every day
  // For testing every minute: "* * * * *"
  const scheduleTime = process.env.JOB_DIGEST_SCHEDULE || '0 9 * * *';

  console.log(`⏰ Starting job digest scheduler (runs at: ${scheduleTime})`);

  cron.schedule(scheduleTime, async () => {
    console.log('\n📧 Running daily job digest task...');
    await sendDailyJobDigests();
  });

  schedulerStarted = true;
  console.log('✅ Job scheduler initialized successfully');
}

/**
 * Send daily job digests to all registered users
 */
async function sendDailyJobDigests() {
  try {
    const users = await User.find({ email: { $ne: null } }).lean();
    console.log(`👥 Found ${users.length} users to send job digests to`);

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        // Fetch jobs posted in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentJobs = await JobListing.find({
          postedDate: { $gte: twentyFourHoursAgo }
        })
          .sort({ postedDate: -1 })
          .limit(15)
          .lean();

        if (recentJobs.length === 0) {
          console.log(`ℹ️ No new jobs for ${user.email}, skipping`);
          continue;
        }

        // Send email with recent jobs
        const result = await sendJobDigestEmail(
          user.email,
          user.name || user.email.split('@')[0],
          recentJobs
        );

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error.message);
        failureCount++;
      }
    }

    console.log(`✅ Job digest task completed: ${successCount} sent, ${failureCount} failed`);
  } catch (error) {
    console.error('❌ Fatal error in daily job digest task:', error);
  }
}

/**
 * Send job digest to a specific user (manual trigger)
 */
export async function sendJobDigestToUser(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return { success: false, message: 'User not found or has no email' };
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentJobs = await JobListing.find({
      postedDate: { $gte: twentyFourHoursAgo }
    })
      .sort({ postedDate: -1 })
      .limit(15)
      .lean();

    if (recentJobs.length === 0) {
      return { success: false, message: 'No new jobs available' };
    }

    const result = await sendJobDigestEmail(
      user.email,
      user.name || user.email.split('@')[0],
      recentJobs
    );

    return result;
  } catch (error) {
    console.error('❌ Error sending digest to user:', error);
    return { success: false, error: error.message };
  }
}

export default { initializeJobScheduler, sendJobDigestToUser };
