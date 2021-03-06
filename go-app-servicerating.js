var go = {};
go;

var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var _ = require('lodash');

go.states = {
    MessengerChoiceState: ChoiceState.extend(function(self, name, opts) {
        /*
        Automatically add the necessary helper metadata for
        ChoiceStates when using the Messenger transport
        */

        opts = _.defaults(opts || {}, {
            helper_metadata: function () {
                // disable for now
                if(true) {
                    return {};
                }

                var i18n = self.im.user.i18n;
                return {
                    messenger: {
                        template_type: 'generic',
                        title: i18n(opts.title),
                        subtitle: i18n(opts.question),
                        image_url: opts.image_url || '',
                        buttons: opts.choices.map(function(choice, index) {
                            return {
                                title: i18n(choice.label),
                                payload: {
                                    content: (index + 1) + '',
                                    in_reply_to: self.im.msg.message_id || null,
                                }
                            };
                        })
                    }
                };
            }
        });

        ChoiceState.call(self, name, opts);

    }),

    "trailing": "comma"
};

go.utils = {
    get_user_profile: function(msg) {
        return msg.helper_metadata.messenger || {};
    }
};

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var MessengerChoiceState = go.states.MessengerChoiceState;
    var EndState = vumigo.states.EndState;
    var _ = require('lodash');

    var JsBoxApp = App.extend(function(self) {
        App.call(self, 'states_start');
        var $ = self.$;

        self.init = function() {
            // See if there's a user profile
            self.user_profile = go.utils.get_user_profile(self.im.msg);
        };

        self.states.add('states_start', function(name) {
            return self.states.create('question_1_friendliness');
        });

        self.states.add('question_1_friendliness', function(name) {
            return new MessengerChoiceState(name, {
                title: 'MomConnect',
                image_url: 'https://www.evernote.com/l/ATmWQI24r-RLoYnAL1eOgbMUFWyFqcPJVpsB/image.jpg',
                question: $('Welcome{{user_name}}. When you signed up, were staff at the facility friendly & helpful?').context({
                    'user_name': (_.isUndefined(self.user_profile.first_name)
                                  ? ''
                                  : ' ' + self.user_profile.first_name)
                }),

                choices: [
                    new Choice('very-satisfied', $('Very Satisfied')),
                    new Choice('satisfied', $('Satisfied')),
                    new Choice('not-satisfied', $('Not Satisfied')),
                    // new Choice('very-unsatisfied', $('Very unsatisfied'))
                ],

                next: 'question_2_waiting_times_feel'
            });
        });

        self.states.add('question_2_waiting_times_feel', function(name) {
            return new MessengerChoiceState(name, {
                title: 'MomConnect',
                question: $('How do you feel about the time you had to wait at the facility?'),

                choices: [
                    new Choice('very-satisfied', $('Very Satisfied')),
                    new Choice('satisfied', $('Satisfied')),
                    new Choice('not-satisfied', $('Not Satisfied')),
                    // new Choice('very-unsatisfied', $('Very unsatisfied'))
                ],

                next: 'question_3_waiting_times_length'
            });
        });

        self.states.add('question_3_waiting_times_length', function(name) {
            return new MessengerChoiceState(name, {
                title: 'MomConnect',
                question: $('How long did you wait to be helped at the clinic?'),

                choices: [
                    new Choice('less-than-an-hour', $('Less than an hour')),
                    new Choice('between-1-and-3-hours', $('Between 1 and 3 hours')),
                    new Choice('more-than-4-hours', $('More than 4 hours')),
                    // new Choice('all-day', $('All day'))
                ],

                next: 'question_4_cleanliness'
            });
        });

        self.states.add('question_4_cleanliness', function(name) {
            return new MessengerChoiceState(name, {
                title: 'MomConnect',
                question: $('Was the facility clean?'),

                choices: [
                    new Choice('very-satisfied', $('Very Satisfied')),
                    new Choice('satisfied', $('Satisfied')),
                    new Choice('not-satisfied', $('Not Satisfied')),
                    // new Choice('very-unsatisfied', $('Very unsatisfied'))
                ],

                next: 'question_5_privacy'
            });
        });

        self.states.add('question_5_privacy', function(name) {
            return new MessengerChoiceState(name, {
                title: 'MomConnect',
                question: $('Did you feel that your privacy was respected by the staff?'),

                choices: [
                    new Choice('very-satisfied', $('Very Satisfied')),
                    new Choice('satisfied', $('Satisfied')),
                    new Choice('not-satisfied', $('Not Satisfied')),
                    // new Choice('very-unsatisfied', $('Very unsatisfied'))
                ],

                next: 'log_servicerating'
            });
        });

        self.states.add('log_servicerating', function(name) {
            return self.im
                .log('Logged service rating: ' + JSON.stringify(self.im.user.answers))
                .then(function() {
                    return self.states.create('end_thanks');
                });
        });

        self.states.add('end_thanks', function(name) {
            return new EndState(name, {
                text: $('Thank you{{user_name}}! Rating our service helps us improve it.').context({
                    'user_name': (_.isUndefined(self.user_profile.first_name)
                                  ? ''
                                  : ' ' + self.user_profile.first_name)
                }),
                next: 'states_start'
            });
        });

    });

    return {
        JsBoxApp: JsBoxApp
    };
}();

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var JsBoxApp = go.app.JsBoxApp;


    return {
        im: new InteractionMachine(api, new JsBoxApp())
    };
}();
