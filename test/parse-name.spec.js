
import parseName from '../src/parse-name';

describe('parseName', () => {
    it('single term return array which has one item', () => {
        let result = parseName('ad12ad12')
        expect(result.length).toBe(1);
        expect(result[0]).toBe('ad12ad12');
    });

    it('multi term, split by dot', () => {
        let result = parseName('t1.t2.t3')
        expect(result.length).toBe(3);
        expect(result[0]).toBe('t1');
        expect(result[1]).toBe('t2');
        expect(result[2]).toBe('t3');
    });

    it('multi term, sequential propaccessors', () => {
        let result = parseName('t1.t2[0]["t4"].t3')
        expect(result.length).toBe(5);
        expect(result[0]).toBe('t1');
        expect(result[2]).toBe(0);
        expect(result[1]).toBe('t2');
        expect(result[3]).toBe('t4');
        expect(result[4]).toBe('t3');
    });

    it('multi term, mixed', () => {
        let result = parseName('t1[0].t2["t4"].t3')
        expect(result.length).toBe(5);
        expect(result[0]).toBe('t1');
        expect(result[1]).toBe(0);
        expect(result[2]).toBe('t2');
        expect(result[3]).toBe('t4');
        expect(result[4]).toBe('t3');
    });
});
