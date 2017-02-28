'use strict';

const expect = require('code').expect;   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before = lab.before;
const it = lab.it;

const BunnyBus = require('bunnybus');
let bunnyBus;

const TokiRabbit = (options, message) => {

    bunnyBus = new BunnyBus(options);

    return bunnyBus.publish(message)
        .then(() => {
            return message;
        });
};

describe('toki-method-rabbit', () => {

    before((done) => {

        bunnyBus = new BunnyBus({
            user    : 'notGuest',
            password: 'notGuest'
        });
        done();
    });

    it('should configure BunnyBus via action configuration', () => {

        return TokiRabbit({
            user    : 'guest',
            password: 'guest'
        }, {
            event: 'toki.request-processed'
        })
            .then(() => {

                expect(bunnyBus.connectionString).to.equal('amqp://guest:guest@127.0.0.1:5672/%2f?heartbeat=2000');
            });
    });

    it('should use the createConfiguration to build the rabbit message', () => {

        return TokiRabbit({
            user: 'guest',
            password: 'guest'
        }, {
            event  : 'toki.request-processed',
            action1: {
                uri       : '{{=it.action1.output.uri}}',
                httpAction: 'POST'
            },
            message: {
                uri       : '{{=it.action2.output.message.uri}}',
                httpAction: 'POST'
            }
        })
            .then((message) => {

                expect(message).to.equal({
                    event  : 'toki.request-processed',
                    action1: {
                        uri       : '{{=it.action1.output.uri}}',
                        httpAction: 'POST'
                    },
                    message: {
                        uri       : '{{=it.action2.output.message.uri}}',
                        httpAction: 'POST'
                    }
                });
            });
    });
});
