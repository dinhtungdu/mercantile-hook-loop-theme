import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import metadata from './block.json';
import './style.css';

function Step( { className, href, label, number } ) {
	const content = (
		<>
			<span className="n">{ number }</span>
			<span>{ label }</span>
		</>
	);

	if ( href ) {
		return (
			<a
				className={ className }
				href={ href }
				onClick={ ( event ) => event.preventDefault() }
			>
				{ content }
			</a>
		);
	}

	return <div className={ className }>{ content }</div>;
}

function Edit( { attributes } ) {
	const { current = 'checkout' } = attributes;
	const isCart = 'cart' === current;
	const isCheckout = 'checkout' === current;
	const isConfirm = 'confirm' === current;
	let detailsClass = 'step';
	if ( isCheckout ) {
		detailsClass = 'step now';
	} else if ( isConfirm ) {
		detailsClass = 'step done';
	}
	const blockProps = useBlockProps( {
		className: 'checkout-head',
	} );

	return (
		<section
			{ ...blockProps }
			aria-label={ __( 'Checkout progress', 'mercantile-2026' ) }
		>
			<div className="ckhead">
				<div className="crumb">
					<span>← { __( 'shop', 'mercantile-2026' ) }</span>
					<b>/</b>
					{ __( 'checkout', 'mercantile-2026' ) }
				</div>
				<div className="meta">
					<span>
						{ __( 'SSL', 'mercantile-2026' ) } ·{ ' ' }
						<b>{ __( 'secure', 'mercantile-2026' ) }</b>
					</span>
					<span>
						{ __( 'est. ship', 'mercantile-2026' ) } ·{ ' ' }
						<b>{ __( '1–2 business days', 'mercantile-2026' ) }</b>
					</span>
				</div>
			</div>
			<div className="step-nav">
				<Step
					className={ `step ${ isCart ? 'now' : 'done' }` }
					href={ isCart ? undefined : '/cart/' }
					number="01"
					label={ __( 'cart', 'mercantile-2026' ) }
				/>
				<Step
					className={ detailsClass }
					href={ isCheckout ? undefined : '/checkout/' }
					number="02"
					label={ __( 'details', 'mercantile-2026' ) }
				/>
				<Step
					className={ `step ${ isConfirm ? 'now' : '' }` }
					number="03"
					label={ __( 'confirm', 'mercantile-2026' ) }
				/>
			</div>
		</section>
	);
}

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
} );
