/**
 * External dependencies
 */
import type { PropsWithChildren } from 'react';
import { useEntityRecord } from '@wordpress/core-data';
import { createElement, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	ValidationErrors,
	ValidationProviderProps,
	Validator,
	ValidatorResponse,
} from './types';
import { ValidationContext } from './validation-context';
import { findFirstInvalidElement } from './helpers';

export function ValidationProvider< T >( {
	postType,
	productId,
	children,
}: PropsWithChildren< ValidationProviderProps > ) {
	const validatorsRef = useRef< Record< string, Validator< T > > >( {} );
	const fieldRefs = useRef< Record< string, HTMLElement > >( {} );
	const [ errors, setErrors ] = useState< ValidationErrors >( {} );
	const { record: initialValue } = useEntityRecord< T >(
		'postType',
		postType,
		productId
	);

	function registerValidator(
		validatorId: string,
		validator: Validator< T >
	): React.Ref< HTMLElement > {
		validatorsRef.current = {
			...validatorsRef.current,
			[ validatorId ]: validator,
		};

		return ( element: HTMLElement ) => {
			fieldRefs.current[ validatorId ] = element;
		};
	}

	function unRegisterValidator( validatorId: string ): void {
		if ( validatorsRef.current[ validatorId ] ) {
			delete validatorsRef.current[ validatorId ];
		}
		if ( fieldRefs.current[ validatorId ] ) {
			delete fieldRefs.current[ validatorId ];
		}
	}

	async function validateField(
		validatorId: string,
		newData?: Partial< T >
	): ValidatorResponse {
		const validators = validatorsRef.current;
		if ( validatorId in validators ) {
			const validator = validators[ validatorId ];
			const result = validator( initialValue, newData );

			return result.then( ( error ) => {
				setErrors( ( currentErrors ) => ( {
					...currentErrors,
					[ validatorId ]: error,
				} ) );
				return error;
			} );
		}

		return Promise.resolve( undefined );
	}

	async function validateAll(
		newData: Partial< T >
	): Promise< ValidationErrors > {
		const newErrors: ValidationErrors = {};
		const validators = validatorsRef.current;

		for ( const validatorId in validators ) {
			newErrors[ validatorId ] = await validateField(
				validatorId,
				newData
			);
		}

		setErrors( newErrors );

		const firstElementWithError = findFirstInvalidElement(
			fieldRefs.current,
			newErrors
		);

		firstElementWithError?.focus();

		return newErrors;
	}

	return (
		<ValidationContext.Provider
			value={ {
				errors,
				registerValidator,
				unRegisterValidator,
				validateField,
				validateAll,
			} }
		>
			{ children }
		</ValidationContext.Provider>
	);
}
