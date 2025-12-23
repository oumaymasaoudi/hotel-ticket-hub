import { cn } from '../utils';

describe('cn utility function', () => {
    it('should merge class names correctly', () => {
        const result = cn('foo', 'bar');
        expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
        const shouldIncludeBar = false;
        const result = cn('foo', shouldIncludeBar && 'bar', 'baz');
        expect(result).toBe('foo baz');
    });

    it('should merge conflicting Tailwind classes', () => {
        const result = cn('px-2 py-1', 'px-4');
        expect(result).toContain('py-1');
        expect(result).toContain('px-4');
        expect(result).not.toContain('px-2');
    });

    it('should handle empty inputs', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle undefined and null values', () => {
        const result = cn('foo', undefined, null, 'bar');
        expect(result).toBe('foo bar');
    });

    it('should handle arrays', () => {
        const result = cn(['foo', 'bar'], 'baz');
        expect(result).toBe('foo bar baz');
    });

    it('should handle objects', () => {
        const result = cn({ foo: true, bar: false, baz: true });
        expect(result).toContain('foo');
        expect(result).toContain('baz');
        expect(result).not.toContain('bar');
    });
});

