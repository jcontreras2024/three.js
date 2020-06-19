/**
 * @author mrdoob / http://mrdoob.com/
 */

import * as THREE from '../../build/three.module.js';

import { UIPanel, UIRow, UIInput, UICheckbox, UIText, UIListbox, UISpan, UIButton, UISelect, UINumber } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';

function SidebarProject( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var strings = editor.strings;

	var currentRenderer = null;

	var container = new UISpan();

	var projectsettings = new UIPanel();
	projectsettings.setBorderTop( '0' );
	projectsettings.setPaddingTop( '20px' );

	container.add( projectsettings );

	// Title

	var titleRow = new UIRow();
	var title = new UIInput( config.getKey( 'project/title' ) ).setLeft( '100px' ).setWidth( '150px' ).onChange( function () {

		config.setKey( 'project/title', this.getValue() );

	} );

	titleRow.add( new UIText( strings.getKey( 'sidebar/project/title' ) ).setWidth( '90px' ) );
	titleRow.add( title );

	projectsettings.add( titleRow );

	// Editable

	var editableRow = new UIRow();
	var editable = new UICheckbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/editable', this.getValue() );

	} );

	editableRow.add( new UIText( strings.getKey( 'sidebar/project/editable' ) ).setWidth( '90px' ) );
	editableRow.add( editable );

	projectsettings.add( editableRow );

	// WebVR

	var vrRow = new UIRow();
	var vr = new UICheckbox( config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/vr', this.getValue() );

	} );

	vrRow.add( new UIText( strings.getKey( 'sidebar/project/vr' ) ).setWidth( '90px' ) );
	vrRow.add( vr );

	projectsettings.add( vrRow );

	// Renderer

	var rendererPanel = new UIPanel();
	container.add( rendererPanel );

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/renderer' ).toUpperCase() ) );
	rendererPanel.add( headerRow );

	// Renderer / Antialias

	var antialiasRow = new UIRow();
	var antialiasBoolean = new UIBoolean( config.getKey( 'project/renderer/antialias' ) ).onChange( function () {

		config.setKey( 'project/renderer/antialias', this.getValue() );
		createRenderer();

	} );

	antialiasRow.add( new UIText( strings.getKey( 'sidebar/project/antialias' ) ).setWidth( '90px' ) );
	antialiasRow.add( antialiasBoolean );

	rendererPanel.add( antialiasRow );

	// Renderer / Shadows

	var shadowsRow = new UIRow();
	var shadowsBoolean = new UIBoolean( config.getKey( 'project/renderer/shadows' ) ).onChange( function () {

		config.setKey( 'project/renderer/shadows', this.getValue() );
		updateRenderer();

	} );

	shadowsRow.add( new UIText( strings.getKey( 'sidebar/project/shadows' ) ).setWidth( '90px' ) );
	shadowsRow.add( shadowsBoolean );

	var shadowTypeSelect = new UISelect().setOptions( {
		0: 'Basic',
		1: 'PCF',
		2: 'PCF (Soft)',
		//	3: 'VSM'
	} ).setWidth( '125px' ).onChange( function () {

		config.setKey( 'project/renderer/shadowType', parseFloat( this.getValue() ) );
		updateRenderer();

	} );
	shadowTypeSelect.setValue( config.getKey( 'project/renderer/shadowType' ) );

	shadowsRow.add( shadowTypeSelect );

	rendererPanel.add( shadowsRow );

	// Renderer / Physically Correct lights

	var physicallyCorrectLightsRow = new UIRow();
	var physicallyCorrectLightsBoolean = new UIBoolean( config.getKey( 'project/renderer/physicallyCorrectLights' ) ).onChange( function () {

		config.setKey( 'project/renderer/physicallyCorrectLights', this.getValue() );
		updateRenderer();

	} );

	physicallyCorrectLightsRow.add( new UIText( strings.getKey( 'sidebar/project/physicallyCorrectLights' ) ).setWidth( '90px' ) );
	physicallyCorrectLightsRow.add( physicallyCorrectLightsBoolean );

	rendererPanel.add( physicallyCorrectLightsRow );

	// Renderer / Tonemapping

	var toneMappingRow = new UIRow();
	var toneMappingSelect = new UISelect().setOptions( {
		0: 'None',
		1: 'Linear',
		2: 'Reinhard',
		3: 'Cineon',
		4: 'ACESFilmic'
	} ).setWidth( '120px' ).onChange( function ( value ) {

		var value = this.getValue();

		config.setKey( 'project/renderer/toneMapping', parseFloat( value ) );
		toneMappingExposure.setDisplay( value === '0' ? 'none' : '' );

		updateRenderer();

	} );
	toneMappingSelect.setValue( config.getKey( 'project/renderer/toneMapping' ) );

	toneMappingRow.add( new UIText( strings.getKey( 'sidebar/project/toneMapping' ) ).setWidth( '90px' ) );
	toneMappingRow.add( toneMappingSelect );

	var toneMappingExposure = new UINumber( config.getKey( 'project/renderer/toneMappingExposure' ) );
	toneMappingExposure.setDisplay( toneMappingSelect.getValue() === '0' ? 'none' : '' );
	toneMappingExposure.setWidth( '30px' ).setMarginLeft( '10px' );
	toneMappingExposure.setRange( 0, 10 );
	toneMappingExposure.onChange( function () {

		config.setKey( 'project/renderer/toneMappingExposure', this.getValue() );
		updateRenderer();

	} );
	toneMappingRow.add( toneMappingExposure );

	rendererPanel.add( toneMappingRow );

	//

	function updateRenderer() {

		currentRenderer.physicallyCorrectLights = physicallyCorrectLightsBoolean.getValue();
		currentRenderer.shadowMap.enabled = shadowsBoolean.getValue();
		currentRenderer.shadowMap.type = parseFloat( shadowTypeSelect.getValue() );
		currentRenderer.toneMapping = parseFloat( toneMappingSelect.getValue() );
		currentRenderer.toneMappingExposure = toneMappingExposure.getValue();

		signals.rendererUpdated.dispatch();

	}

	function createRenderer() {

		currentRenderer = new THREE.WebGLRenderer( { antialias: antialiasBoolean.getValue() } );
		currentRenderer.outputEncoding = THREE.sRGBEncoding;
		currentRenderer.physicallyCorrectLights = physicallyCorrectLightsBoolean.getValue();
		currentRenderer.shadowMap.enabled = shadowsBoolean.getValue();
		currentRenderer.shadowMap.type = parseFloat( shadowTypeSelect.getValue() );
		currentRenderer.toneMapping = parseFloat( toneMappingSelect.getValue() );
		currentRenderer.toneMappingExposure = toneMappingExposure.getValue();

		signals.rendererChanged.dispatch( currentRenderer );

	}

	createRenderer();

	// Materials

	var materials = new UIPanel();

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/materials' ).toUpperCase() ) );

	materials.add( headerRow );

	var listbox = new UIListbox();
	materials.add( listbox );

	var buttonsRow = new UIRow();
	buttonsRow.setPadding( '10px 0px' );
	materials.add( buttonsRow );

	/*
	var addButton = new UI.Button().setLabel( 'Add' ).setMarginRight( '5px' );
	addButton.onClick( function () {

		editor.addMaterial( new THREE.MeshStandardMaterial() );

	} );
	buttonsRow.add( addButton );
	*/

	var assignMaterial = new UIButton().setLabel( strings.getKey( 'sidebar/project/Assign' ) ).setMargin( '0px 5px' );
	assignMaterial.onClick( function () {

		var selectedObject = editor.selected;

		if ( selectedObject !== null ) {

			var oldMaterial = selectedObject.material;

			// only assing materials to objects with a material property (e.g. avoid assigning material to THREE.Group)

			if ( oldMaterial !== undefined ) {

				var material = editor.getMaterialById( parseInt( listbox.getValue() ) );

				if ( material !== undefined ) {

					editor.removeMaterial( oldMaterial );
					editor.execute( new SetMaterialCommand( editor, selectedObject, material ) );
					editor.addMaterial( material );

				}

			}

		}

	} );
	buttonsRow.add( assignMaterial );

	container.add( materials );

	// events

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			var index = Object.values( editor.materials ).indexOf( object.material );
			listbox.selectIndex( index );

		}

	} );

	signals.materialAdded.add( refreshMaterialBrowserUI );
	signals.materialChanged.add( refreshMaterialBrowserUI );
	signals.materialRemoved.add( refreshMaterialBrowserUI );

	function refreshMaterialBrowserUI() {

		listbox.setItems( Object.values( editor.materials ) );

	}

	return container;

}

export { SidebarProject };
