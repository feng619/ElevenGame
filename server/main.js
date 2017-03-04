import { Meteor } from 'meteor/meteor';
import { Eleven } from '../imports/collections/eleven';

Meteor.startup(() => {

  Meteor.publish('eleven', function() {
    return Eleven.find({});
  });

});
