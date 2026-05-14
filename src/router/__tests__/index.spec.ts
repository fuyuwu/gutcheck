// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import router from '../index'

describe('router/index', () => {
  describe('route configuration', () => {
    it('defines all expected routes', () => {
      const names = router.getRoutes().map((r) => r.name)
      expect(names).toContain('today')
      expect(names).toContain('log')
      expect(names).toContain('trend')
      expect(names).toContain('settings')
      expect(names).toContain('not-found')
    })

    it('maps correct paths to route names', () => {
      const byName = Object.fromEntries(router.getRoutes().map((r) => [r.name, r.path]))
      expect(byName['today']).toBe('/')
      expect(byName['log']).toBe('/log')
      expect(byName['trend']).toBe('/trend')
      expect(byName['settings']).toBe('/settings')
      expect(byName['not-found']).toBe('/:pathMatch(.*)*')
    })
  })

  describe('route resolution', () => {
    it('resolves / to today', () => {
      expect(router.resolve('/').name).toBe('today')
    })

    it('resolves /log to log', () => {
      expect(router.resolve('/log').name).toBe('log')
    })

    it('resolves /trend to trend', () => {
      expect(router.resolve('/trend').name).toBe('trend')
    })

    it('resolves /settings to settings', () => {
      expect(router.resolve('/settings').name).toBe('settings')
    })

    it('catches unknown paths with not-found', () => {
      expect(router.resolve('/does-not-exist').name).toBe('not-found')
      expect(router.resolve('/a/b/c').name).toBe('not-found')
    })
  })
})
