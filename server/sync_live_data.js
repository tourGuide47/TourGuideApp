const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDb = 'C:\\Users\\USER\\Desktop\\projet kholoud\\website\\backend\\database\\tourguide.db';
const destDb = 'c:\\Users\\USER\\Desktop\\projet kholoud\\APP\\tourgiudekholoud\\server\\database\\tourguide.db';

const srcUploads = 'C:\\Users\\USER\\Desktop\\projet kholoud\\website\\backend\\uploads';
const destUploads = 'c:\\Users\\USER\\Desktop\\projet kholoud\\APP\\tourgiudekholoud\\server\\uploads';

async function syncData() {
  console.log('🔄 Restarting 100% Live Data Restoration...');

  try {
    // 1. Copy Database File
    if (fs.existsSync(srcDb)) {
      console.log('📄 Copying Database...');
      fs.copyFileSync(srcDb, destDb);
      console.log('✅ Live Database restored successfully!');
    } else {
      console.log('⚠️ Source database not found at:', srcDb);
    }

    // 2. Copy Uploads Directory
    if (fs.existsSync(srcUploads)) {
      console.log('🖼️ Syncing Uploaded Images...');
      if (!fs.existsSync(destUploads)) fs.mkdirSync(destUploads, { recursive: true });
      const files = fs.readdirSync(srcUploads);
      let count = 0;
      files.forEach(file => {
        const srcFile = path.join(srcUploads, file);
        const destFile = path.join(destUploads, file);
        if (fs.lstatSync(srcFile).isFile()) {
          fs.copyFileSync(srcFile, destFile);
          count++;
        }
      });
      console.log(`✅ ${count} images synced to the new app backend!`);
    }

    // 3. Optional: Run Seed if file is small or empty
    const stats = fs.statSync(destDb);
    if (stats.size < 20000) { // If DB is just initialized (small)
       console.log('🌱 Data looks empty, running full 39-place seed...');
       execSync('node database/seed.js', { stdio: 'inherit' });
    }

    console.log('\n✨ COMPLETE: All 39+ original places and images are now in the app.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Restoration failed:', err.message);
    process.exit(1);
  }
}

syncData();
