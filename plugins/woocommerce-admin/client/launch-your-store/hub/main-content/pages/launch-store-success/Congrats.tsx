/* eslint-disable @woocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { getSetting } from '@woocommerce/settings';
import { recordEvent } from '@woocommerce/tracks';
import { createInterpolateElement, useState } from '@wordpress/element';
import { Link, ConfettiAnimation } from '@woocommerce/components';
import { isInteger } from 'lodash';
import { closeSmall } from '@wordpress/icons';
import { CustomerFeedbackSimple } from '@woocommerce/customer-effort-score';
import { useCopyToClipboard } from '@wordpress/compose';
import { Button, TextareaControl, Icon, Dashicon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { ONBOARDING_STORE_NAME } from '@woocommerce/data';

/**
 * Internal dependencies
 */
import './style.scss';
import WooLogo from '~/core-profiler/components/navigation/woologo';
import { navigateTo } from '@woocommerce/navigation';

export type CongratsProps = {
	hasCompleteSurvey: boolean;
	isWooExpress: boolean;
	completeSurvey: () => void;
	children?: React.ReactNode;
};

export const Congrats = ( {
	hasCompleteSurvey,
	isWooExpress,
	completeSurvey,
	children,
}: CongratsProps ) => {
	const copyLink = __( 'Copy link', 'woocommerce' );
	const copied = __( 'Copied!', 'woocommerce' );
	const homeUrl: string = getSetting( 'homeUrl', '' );
	const urlObject = new URL( homeUrl );
	let hostname: string = urlObject?.hostname;
	if ( urlObject?.port ) {
		hostname += ':' + urlObject.port;
	}

	const [ isShowSurvey, setIsShowSurvey ] = useState< boolean >(
		! hasCompleteSurvey
	);
	const [ score, setScore ] = useState< number | null >( null );
	const [ feedbackText, setFeedbackText ] = useState< string >( '' );
	const [ isShowThanks, setIsShowThanks ] = useState< boolean >( false );
	const [ copyLinkText, setCopyLinkText ] = useState( copyLink );

	const shouldShowComment = isInteger( score );

	const copyClipboardRef = useCopyToClipboard< HTMLAnchorElement >(
		homeUrl,
		() => {
			setCopyLinkText( copied );
			setTimeout( () => {
				setCopyLinkText( copyLink );
			}, 2000 );
		}
	);

	const { invalidateResolutionForStoreSelector } = useDispatch(
		ONBOARDING_STORE_NAME
	);

	const sendData = () => {
		recordEvent( 'launch_your_store_congrats_survey_complete', {
			action: 'lys_experience',
			score,
			comments: feedbackText,
		} );

		setIsShowThanks( true );
		completeSurvey();
	};

	return (
		<div className="woocommerce-launch-store__congrats">
			<ConfettiAnimation
				delay={ 1000 }
				colors={ [
					'#DFD1FB',
					'#FB79D9',
					'#FFA60E',
					'#03D479',
					'#AD86E9',
					'#7F54B3',
					'#3C2861',
				] }
			/>
			<div className="woocommerce-launch-store__congrats-header-container">
				<span className="woologo">
					<WooLogo />
				</span>
				<Button
					onClick={ () => {
						recordEvent(
							'launch_your_store_congrats_back_to_home_click'
						);
						invalidateResolutionForStoreSelector( 'getTaskLists' );
						navigateTo( { url: '/' } );
					} }
					className="back-to-home-button"
					variant="link"
				>
					<Dashicon icon="arrow-left-alt2"></Dashicon>
					<span>{ __( 'Back to Home', 'woocommerce' ) }</span>
				</Button>
			</div>
			<div className="woocommerce-launch-store__congrats-content">
				<h1 className="woocommerce-launch-store__congrats-heading">
					{ __(
						'Congratulations! Your store is now live',
						'woocommerce'
					) }
				</h1>
				<h2 className="woocommerce-launch-store__congrats-subheading">
					{ __(
						"You've successfully launched your store and are ready to start selling! We can't wait to see your business grow.",
						'woocommerce'
					) }
				</h2>
				<div className="woocommerce-launch-store__congrats-midsection-container">
					<div className="woocommerce-launch-store__congrats-visit-store">
						<p className="store-name">{ hostname }</p>
						<div className="buttons-container">
							<Button
								className=""
								variant="secondary"
								ref={ copyClipboardRef }
								onClick={ () => {
									recordEvent(
										'launch_your_store_congrats_copy_store_link_click'
									);
								} }
							>
								{ copyLinkText }
							</Button>
							<Button
								className=""
								variant="primary"
								onClick={ () => {
									recordEvent(
										'launch_your_store_congrats_preview_store_click'
									);
									window.open( homeUrl, '_blank' );
								} }
							>
								{ __( 'Visit your store', 'woocommerce' ) }
							</Button>
						</div>
					</div>

					{ isShowSurvey && <hr className="separator" /> }

					{ isShowSurvey && (
						<div className="woocommerce-launch-store__congrats-survey">
							{ isShowThanks ? (
								<div className="woocommerce-launch-store__congrats-thanks">
									<p className="thanks-copy">
										🙌{ ' ' }
										{ __(
											'We appreciate your feedback!',
											'woocommerce'
										) }
									</p>
									<Button
										className="close-button"
										label={ __( 'Close', 'woocommerce' ) }
										icon={
											<Icon
												icon={ closeSmall }
												viewBox="6 4 12 14"
											/>
										}
										iconSize={ 14 }
										size={ 24 }
										onClick={ () => {
											setIsShowThanks( false );
											setIsShowSurvey( false );
										} }
									></Button>
								</div>
							) : (
								<div className="woocommerce-launch-store__congrats-section_1">
									<div className="woocommerce-launch-store__congrats-survey__selection">
										<CustomerFeedbackSimple
											label={ __(
												'How was the experience of launching your store?',
												'woocommerce'
											) }
											onSelect={ setScore }
											selectedValue={ score }
										/>
									</div>
									{ shouldShowComment && (
										<div className="woocommerce-launch-store__congrats-survey__comment">
											<label
												className="comment-label"
												htmlFor="launch-your-store-comment"
											>
												{ createInterpolateElement(
													__(
														'Why do you feel that way? <smallText>(optional)</smallText>',
														'woocommerce'
													),
													{
														smallText: (
															<span className="small-text" />
														),
													}
												) }
											</label>
											<TextareaControl
												id="launch-your-store-comment"
												value={ feedbackText }
												onChange={ ( value ) => {
													setFeedbackText( value );
												} }
											/>
											<span className="privacy-text">
												{ createInterpolateElement(
													__(
														'Your feedback will be only be shared with WooCommerce and treated in accordance with our <privacyLink>privacy policy</privacyLink>.',
														'woocommerce'
													),
													{
														privacyLink: (
															<Link
																href="https://automattic.com/privacy/"
																type="external"
																target="_blank"
															>
																<></>
															</Link>
														),
													}
												) }
											</span>
										</div>
									) }
								</div>
							) }
							{ shouldShowComment && ! isShowThanks && (
								<div className="woocommerce-launch-store__congrats-section_2">
									<div className="woocommerce-launch-store__congrats-buttons">
										<Button
											className=""
											variant="tertiary"
											onClick={ () => {
												setScore( null );
											} }
										>
											{ __( 'Cancel', 'woocommerce' ) }
										</Button>
										<Button
											className=""
											variant="primary"
											onClick={ () => {
												recordEvent(
													isWooExpress
														? 'launch_your_store_congrats_survey_click'
														: 'launch_your_store_on_core_congrats_survey_click'
												);
												sendData();
											} }
										>
											{ __( 'Send', 'woocommerce' ) }
										</Button>
									</div>
								</div>
							) }
						</div>
					) }
				</div>
				{ children }
			</div>
		</div>
	);
};
