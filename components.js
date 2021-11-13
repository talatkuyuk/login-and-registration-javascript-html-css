const profile_property_template = `<span class="chip"></span>`;

const profile_allergy_template = `
<div class="allergy-container">
	<div class="outer-ring"></div>
	<div class="inner-ring"></div>
	<div class="allergy"></div>
</div>`;

const profile_card_template = `
<fieldset class="safemeals-profile-card">
	<legend class="safemeals-profile-legend">
		<span class="safemeals-profile-name"></span>
		<span class="safemeals-profile-type"></span>
	</legend>
	<span class="material-icons">edit</span>
	<div class="safemeals-profile-properties">
		<span class="safemeals-profile-property allergies active">Allergies</span>
		<span class="safemeals-profile-property likes">Likes</span>
		<span class="safemeals-profile-property dislikes">Dislikes</span>
		<span class="safemeals-profile-property preferences">Preferences</span>
		<hr>
	</div>
	<div class="safemeals-profile-values">
		<div class="safemeals-profile-value allergies active"></div>
		<div class="safemeals-profile-value likes"></div>
		<div class="safemeals-profile-value dislikes"></div>
		<div class="safemeals-profile-value preferences"></div>
	</div>
</fieldset>`;


const profile_card_final_tobe = `
<fieldset class="safemeals-profile-card">
	<legend class="safemeals-profile-legend">
		<span class="safemeals-profile-name"></span>
		<span class="safemeals-profile-type"></span>
	</legend>
	<div class="safemeals-profile-properties">
		<span class="safemeals-profile-property allergies active">Allergies</span>
		<span class="safemeals-profile-property likes">Likes</span>
		<span class="safemeals-profile-property dislikes">Dislikes</span>
		<span class="safemeals-profile-property preferences">Preferences</span>
		<hr>
	</div>
	<div class="safemeals-profile-values">
		<div class="safemeals-profile-value allergies active">
			<div class="allergy-container">
				<div class="outer-ring"></div>
				<div class="inner-ring"></div>
				<div class="allergy"></div>
			</div>
		</div>
		<div class="safemeals-profile-value likes">
			<span class="chip"></span>
		</div>
		<div class="safemeals-profile-value dislikes">
			<span class="chip"></span>
		</div>
		<div class="safemeals-profile-value preferences">
			<span class="chip"></span>
		</div>
	</div>
</fieldset>`;