/**
 * External dependencies
 */
import clsx from 'clsx';
import { Spinner } from '@woocommerce/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { MainContentComponentProps } from '../../xstate';
import { Congrats } from './Congrats';
export * as actions from './actions';
export * as services from './services';
export type events = { type: 'COMPLETE_SURVEY' };
import { WhatsNext } from './WhatsNext';
import { isWooExpress } from '~/utils/is-woo-express';

export const LaunchYourStoreSuccess = ( props: MainContentComponentProps ) => {
	const completeSurvey = () => {
		props.sendEventToMainContent( { type: 'COMPLETE_SURVEY' } );
	};

	// Temporary spinner until data load is moved to loading screen or somewhere else.
	if ( ! props.context.congratsScreen.hasLoadedCongratsData ) {
		return (
			<div className="spinner-container">
				<Spinner></Spinner>
			</div>
		);
	}

	return (
		<div
			className={ clsx(
				'launch-store-success-page__container',
				props.className
			) }
		>
			<Congrats
				hasCompleteSurvey={
					props.context.congratsScreen.hasCompleteSurvey
				}
				isWooExpress={ isWooExpress() }
				completeSurvey={ completeSurvey }
			>
				<h2 className="woocommerce-launch-store__congrats-main-actions-title">
					{ __( "What's next?", 'woocommerce' ) }
				</h2>
				<WhatsNext
					activePlugins={ props.context.congratsScreen.activePlugins }
					allTasklists={ props.context.congratsScreen.allTasklists }
				/>
			</Congrats>
		</div>
	);
};
