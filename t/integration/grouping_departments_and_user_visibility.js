
'use strict';

const
  test                   = require('selenium-webdriver/testing'),
  By                     = require('selenium-webdriver').By,
  expect                 = require('chai').expect,
  _                      = require('underscore'),
  Promise                = require("bluebird"),
  fs                     = Promise.promisifyAll(require('fs')),
  csv                    = Promise.promisifyAll(require('csv')),
  register_new_user_func = require('../lib/register_new_user'),
  login_user_func        = require('../lib/login_with_user'),
  logout_user_func       = require('../lib/logout_user'),
  open_page_func         = require('../lib/open_page'),
  submit_form_func       = require('../lib/submit_form'),
  add_new_user_func      = require('../lib/add_new_user'),
  config                 = require('../lib/config'),
  user_info_func         = require('../lib/user_info'),
  application_host       = config.get_application_host(),
  new_department_form_id = '#add_new_department_form',
  department_edit_form_id = '#department_edit_form';

/*
 *  The idea of scenario is to check the system respects the secondary departments.
 *
 *  Scenario:
 *    * register company
 *    * add following primary departments: NY Sales, NY Analists, NY Execs
 *      FL Sales, FL Analists, FL Execs
 *    * add following secondary departments: NY and FL
 *    * via import users feature fill departments with at least two users
 *
 *    * ensure that borth exec teams are heads of other team from the same location
 *    * place all NY-related people into secondary department "NY"
 *    * place all FL-related people into secandary department "FL"
 *    * login as somebody of regular user from FL and ensure that he sees
 *      all his peeris from FL in the team view, but noone from NY
 *    * login as somebody of regular user from NY and ensure that he sees
 *      all his peeris from NY in the team view, but noone from FL
 *
 * */

describe('Peer visibility based on secondary/grouping departments', function(){

  this.timeout( config.get_execution_timeout() );

  let email_admin,
      driver,
      csv_data,
      sample_email,
      department_to_users_map = {},
      test_users_filename =  __dirname +'/../test.csv';

  it('Create new company', function(done){
    register_new_user_func({
      application_host : application_host,
    })
    .then(data => {
      driver = data.driver;
      done();
    });
  });

  it("Open page with department list", done => {
    open_page_func({
      url    : application_host + 'settings/departments/',
      driver : driver,
    })
    .then(() => done());
  });

  it('Add all departments', function(done){
    Promise
      .each(
        ['NY Sales', 'NY Analysts', 'NY Execs', 'FL Sales', 'FL Analysts', 'FL Execs', 'NY', 'FL'],
        (department_name) => driver
          .findElement(By.css('#add_new_department_btn'))
          .then(el => el.click())
          .then(() => {

            // This is very important line when working with Bootstrap modals!
            driver.sleep(1000);

            return submit_form_func({
              driver      : driver,
              form_params : [{
                selector : new_department_form_id+' input[name="name__new"]',
                value    : department_name,
              },{
                selector        : new_department_form_id+' select[name="allowance__new"]',
                option_selector : 'option[value="15"]',
                value : '15',
              }],
              submit_button_selector : new_department_form_id+' button[type="submit"]',
              message : /Changes to departments were saved/,
            });
          })
        )
        .then(() => done());
  });

  it('Navigate to bulk upload page', function(done){
    open_page_func({
      url    : application_host + 'users/import/',
      driver : driver,
    })
    .then(() => done());
  });

  it('Create test .CSV file for the test', function(done){
    csv_data = [['email', 'name', 'lastname', 'department']];

    let token = (new Date()).getTime();

    let departments_to_distribute = [
      'NY Sales', 'NY Sales', 'NY Analysts', 'NY Analysts', 'NY Execs',
      'FL Sales', 'FL Sales', 'FL Analysts', 'FL Analysts', 'FL Execs',
    ];

    let i = 0;
    departments_to_distribute.forEach(department => {

      i++;

      csv_data.push([
        'test_csv_'+i+'_'+token+'@test.com',
        'name_csv_'+i+'_'+token+'@test.com',
        'lastname_csv_'+i+'_'+token+'@test.com',
        department
      ]);

      if ( ! department_to_users_map[department]) {
        department_to_users_map[ department ] = [];
      }

      department_to_users_map[ department ].push( 'test_csv_'+i+'_'+token+'@test.com' );
    });

    // Safe one of the emails
    sample_email = csv_data[1][0];

    Promise.resolve()
      .then(() => fs.unlinkAsync(test_users_filename))
      .catch(err => Promise.resolve())
      .then(() => csv.stringifyAsync( csv_data ))
      .then(data => fs.writeFileAsync(test_users_filename, data))
      .then(() => done());
  });

  it('Upload user import file', function(done){
    let regex = new RegExp(
      'Successfully imported users with following emails: '
      + csv_data.slice(1).map(it => it[0]).sort().join(', ')
    );

    submit_form_func({
      submit_button_selector : '#submit_users_btn',
      driver : driver,
      form_params : [{
        selector : '#users_input_inp',
        value    : test_users_filename,
        file     : true,
      }],
      message : regex,
    })
    .then(() => done());
  });

  it('Ensure that borth exec teams are heads of other team from the same location', done => {
  
    VPP ERROR
  });


  after(function(done){
    console.dir(department_to_users_map);
    Promise.resolve()
      .then(() => driver.quit())
      .then(() => fs.unlinkAsync(test_users_filename))
      .catch(err => Promise.resolve())
      .then(() => done());
  });

});
