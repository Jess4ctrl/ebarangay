const { sequelize } = require('./config/db');
const { DocumentDownload } = require('./models');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');

    // Force sync to create/update tables
    await sequelize.sync({ alter: true });

    console.log('✅ Database synced successfully!');

    // Check if DocumentDownload table exists
    const tables = await sequelize.query("SHOW TABLES", {
      type: sequelize.QueryTypes.SHOWTABLES
    });

    console.log('📊 Available tables:', tables);

    if (tables.includes('document_downloads')) {
      console.log('✅ document_downloads table exists');

      // Check existing records
      const downloads = await DocumentDownload.findAll({ limit: 5 });
      console.log('📈 Existing download records:', downloads.length);
    } else {
      console.log('❌ document_downloads table NOT found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();