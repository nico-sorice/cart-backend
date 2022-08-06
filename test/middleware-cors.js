const path = require('path');
const { expect } = require('chai');
const config = require(path.join(__dirname, '..', 'config'));
const corsMiddleware = require(path.join(__dirname, '..', 'src', 'middleware', 'cors'));

describe('cors middleware', () => {
    it('should default to not adding headers', () => {
        const res = {
            headers: {},
            setHeader(key, value) {
                this.headers[key] = value
            },
        };

        corsMiddleware.configure({})({}, res, () => {
        });

        expect(res.headers).to.not.have.property('Access-Control-Allow-Origin');
        expect(res.headers).to.not.have.property('Access-Control-Allow-Methods');
        expect(res.headers).to.not.have.property('Access-Control-Allow-Headers');
    });

    //TODO: Test everything else
});