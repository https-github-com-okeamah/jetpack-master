import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from 'state/reducer-minimal';

export default createJetpackStore();

/**
 * Creates redux store
 *
 * @return {object} store
 */
function createJetpackStore() {
	const finalCreateStore = compose(
		applyMiddleware( thunk ),
		typeof window === 'object' && typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
			? window.__REDUX_DEVTOOLS_EXTENSION__()
			: f => f
	)( createStore );
	return finalCreateStore( reducer );
}
