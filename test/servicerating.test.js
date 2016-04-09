var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;
var _ = require('lodash');
var assert = require('assert');


describe("app", function() {
    describe("for service rating use", function() {
        var app;
        var tester;

        beforeEach(function() {

            go.utils.get_user_profile = function (msg) {
                return {
                    first_name: 'Name',
                    last_name: 'Surname',
                    profile_pic: 'https://example.org/pic.png',
                }
            }

            app = new go.app.JsBoxApp();

            tester = new AppTester(app);
            tester
                .setup.char_limit(320)
                .setup.config.app({
                    name: 'servicerating',
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("when the user starts a session", function() {
            it("should ask for their friendliness rating", function() {
                return tester
                    .setup.char_limit(160)  // limit first state chars
                    .setup.user.addr('27001')
                    .inputs({session_event: 'new'})
                    .check.reply(function (reply) {
                        assert.ok(reply.helper_metadata.messenger);
                        assert.equal(
                            reply.helper_metadata.messenger.template_type,
                            'generic');
                        // Test that the translation is working
                        assert.equal(
                            reply.helper_metadata.messenger.title,
                            'MomConnect')
                        assert.equal(
                            reply.helper_metadata.messenger.subtitle,
                            'Welcome Name. When you signed up, were staff at the facility friendly & helpful?'
                        );
                    })
                    .check.interaction({
                        state: 'question_1_friendliness',
                        reply: [
                            'Welcome Name. When you signed up, were staff at the facility friendly & helpful?',
                            '1. 😍',
                            '2. 👍',
                            '3. 👎',
                            // '4. Very unsatisfied'
                        ].join('\n')
                    })
                    .run();
            });

        });

        describe("when the user answers their friendliness rating", function() {
            it("should ask for their waiting times feeling", function() {
                return tester
                    .inputs({session_event: 'new'}, '1')
                    .check.interaction({
                        state: 'question_2_waiting_times_feel',
                        reply: [
                            'How do you feel about the time you had to wait at the facility?',
                            '1. Very Satisfied',
                            '2. Satisfied',
                            '3. Not Satisfied',
                            // '4. Very unsatisfied'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user answers their waiting times feeling", function() {
            it("should ask for their waiting times length feeling", function() {
                return tester
                    .inputs({session_event: 'new'}, '1', '1')
                    .check.interaction({
                        state: 'question_3_waiting_times_length',
                        reply: [
                            'How long did you wait to be helped at the clinic?',
                            '1. Less than an hour',
                            '2. Between 1 and 3 hours',
                            '3. More than 4 hours',
                            // '4. All day'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user answers their waiting times length feeling", function() {
            it("should ask for their cleanliness rating", function() {
                return tester
                    .inputs({session_event: 'new'}, '1', '1', '1')
                    .check.interaction({
                        state: 'question_4_cleanliness',
                        reply: [
                            'Was the facility clean?',
                            '1. Very Satisfied',
                            '2. Satisfied',
                            '3. Not Satisfied',
                            // '4. Very unsatisfied'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user answers their cleanliness rating", function() {
            it("should ask for their privacy rating", function() {
                return tester
                    .inputs({session_event: 'new'}, '1', '1', '1', '1')
                    .check.interaction({
                        state: 'question_5_privacy',
                        reply: [
                            'Did you feel that your privacy was respected by the staff?',
                            '1. Very Satisfied',
                            '2. Satisfied',
                            '3. Not Satisfied',
                            // '4. Very unsatisfied'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user answers their privacy rating", function() {
            it("should thank and end", function() {
                return tester
                    .inputs({session_event: 'new'}, '1', '1', '1', '1', '1')
                    .check.reply(function (reply) {
                        assert.equal(reply.helper_metadata, null);
                    })
                    .check.interaction({
                        state: 'end_thanks',
                        reply: [
                            'Thank you Name! Rating our service helps us improve it.'
                        ].join('\n')
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });
    });
});
