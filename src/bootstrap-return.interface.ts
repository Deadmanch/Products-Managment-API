import { Container } from 'inversify';
import { App } from './app';

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}
