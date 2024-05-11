'use strict';
const bcrypt = require('bcrypt')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      first_name: 'Gon',
      last_name: 'Freecss',
      email: 'RockBeatsScissors@hunterxhunter.com',
      role: 'admin',
      password_digest: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      created_at: new Date(),
      updated_at: new Date()
    }])
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.bulkDelete('users', {
    email: 'RockBeatsScissors@hunterxhunter.com'
   })
  }
};
