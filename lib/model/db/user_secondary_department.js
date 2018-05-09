
"use strict";

module.exports = function(sequelize, DataTypes){
  var UserSecondaryDepartment = sequelize.define("UserSecondaryDepartment", {}, {
    underscored     : true,
    freezeTableName : true,
    timestamps      : true,
    createdAt       : 'created_at',
    updatedAt       : false,
    indexes : [{
      fields : [ 'department_id' ],
    },{
      fields : [ 'user_id' ],
    }],

    classMethods : {
      associate : function(models) {

        UserSecondaryDepartment.belongsTo(models.Department, {
          as         : 'department',
          foreignKey : 'department_id',
        });

        UserSecondaryDepartment.belongsTo(models.User, {
          as         : 'user',
          foreignKey : 'user_id',
        });
      },
    },

  });

  return UserSecondaryDepartment;
};
