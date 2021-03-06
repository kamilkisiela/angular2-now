export default (angular2now, ngModuleName) => {
  describe('@State()', () => {
    let target;
    const state = {
      name: 'test'
    };
    // spies
    const spyLocation = {};
    const spyUrlRouter = {};
    const spyState = {};

    /**
     * Call State on target and load ng module
     */
    function doStateRaw(opts) {
      const result = angular2now.State(opts)(target);

      window.module(ngModuleName);
      inject();

      return result;
    }

    /**
     * Same as doStateRaw but with predefined state options
     */
    function doState(opts) {
      return doStateRaw(angular.merge(angular.copy(state), opts));
    }

    /**
     * Get option's value from state definition object
     */
    function getSDO(opt) {
      return spyState.state.calls.mostRecent().args[1][opt];
    }

    /**
     * Use it if you want to set state's option
     * and you expect the same value on state definition object.
     */
    function expectSDO(name, value) {
      doState({
        [name]: value
      });
      expect(getSDO(name)).toEqual(value);
    }

    beforeEach(() => {
      // reset target
      target = {};
      // set spies
      angular.module('providersConfig', ['ui.router'])
        .config(function ($locationProvider, $urlRouterProvider, $stateProvider) {
          // spy on html5Mode
          spyLocation.html5Mode = spyOn($locationProvider, 'html5Mode');
          // spy on otherwise
          spyUrlRouter.otherwise = spyOn($urlRouterProvider, 'otherwise');
          // spy on state
          spyState.state = spyOn($stateProvider, 'state');
        });
      window.module('providersConfig');
      angular2now.SetModule(`ns:${ngModuleName}`, ['ui.router']);
    });

    describe('before target', () => {
      it('should fail on missing options', () => {
        expect(() => {
          angular2now.State();
        }).toThrowError(Error, /options/);
      });

      it('should fail on missing name option', () => {
        expect(() => {
          angular2now.State({
            foo: 'bar'
          });
        }).toThrowError(Error, /options/);
      });

      it('should fail if argument is not an instance of Object', () => {
        expect(() => {
          angular2now.State('');
        }).toThrowError(Error, /options/);
      });
    });

    describe('html5Mode', () => {
      it('should set html5Mode', () => {
        doState({
          html5Mode: true
        });
        expect(spyLocation.html5Mode).toHaveBeenCalledWith(true);
      });
    });

    describe('defaultRoute', () => {
      it('should set url option if true', () => {
        doState({
          url: 'foo',
          defaultRoute: true
        });
        expect(spyUrlRouter.otherwise).toHaveBeenCalledWith('foo');
      });

      it('should set defaultRoute option if string', () => {
        doState({
          url: 'foo',
          defaultRoute: 'bar'
        });
        expect(spyUrlRouter.otherwise).toHaveBeenCalledWith('bar');
      });
    });

    describe('state', () => {
      describe('name', () => {
        it('should set the same name as in options', () => {
          doState();
          expect(spyState.state).toHaveBeenCalledWith(state.name, jasmine.any(Object));
        });
      });
      describe('url', () => {
        it('should be the same as in options', () => {
          expectSDO('url', 'foo');
        });
      });

      describe('params', () => {
        it('should be the same as in options', () => {
          expectSDO('params', {
            foo: 'bar'
          });
        });
      });

      describe('abstract', () => {
        it('should be the same as in options', () => {
          expectSDO('abstract', true);
        });
      });

      describe('template', () => {
        it('should be the same as in options', () => {
          expectSDO('template', '<foo></foo>');
          //
          expect(getSDO('templateUrl')).toBeUndefined();
          expect(getSDO('templateProvider')).toBeUndefined();
        });

        it('should contain div with ui-view directive', () => {
          doState({});
          expect(getSDO('template')).toContain('div');
          expect(getSDO('template')).toContain('ui-view');
          expect(getSDO('templateUrl')).toBeUndefined();
          expect(getSDO('templateProvider')).toBeUndefined();
        });
      });

      describe('templateUrl', () => {
        it('should be the same as in options', () => {
          expectSDO('templateUrl', 'foo.html');
          //
          expect(getSDO('template')).toBeUndefined();
          expect(getSDO('templateProvider')).toBeUndefined();
        });
      });

      describe('templateProvider', () => {
        it('should be the same as in options', () => {
          expectSDO('templateProvider', function templateProvider() {});
          //
          expect(getSDO('template')).toBeUndefined();
          expect(getSDO('templateUrl')).toBeUndefined();
        });
      });

      describe('onEnter', () => {
        it('should be the same as in options', () => {
          expectSDO('onEnter', function onEnter() {});
        });
      });

      describe('onExit', () => {
        it('should be the same as in options', () => {
          expectSDO('onExit', function onExit() {});
        });
      });

      describe('data', () => {
        it('should be the same as in options', () => {
          expectSDO('data', {
            foo: 'bar'
          });
        });
      });

      describe('parent', () => {
        it('should be the same as in options', () => {
          expectSDO('parent', 'baz');
        });
      });

      describe('controller', () => {
        it('should use target if no controller provided', () => {
          doState();
          expect(getSDO('controller')).toBe(target);
        });
      });
    });

    describe('resolve', () => {
      it('should remove namespace from services', () => {
        const resolve = jasmine.createSpyObj('resolve', ['foo', 'bar']);

        function controller() {
        }

        controller.$inject = ['ns_bar'];

        doState({
          resolve,
          controller
        });

        expect(getSDO('controller').$inject).toContain('bar');
      });
    });
  });
};
