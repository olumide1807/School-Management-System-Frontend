import Input from "../../../Components/Forms/Input";

const SchoolDetails = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNestedInputChange = (event) => {
    const { name, value } = event.target;
    const [parent, child] = name.split(".");
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [child]: value,
      },
    });
  };

  return (
    <>
      <div className="flex flex-col gap-y-9">
        <Input
          name="schoolName"
          type="text"
          placeholder="School name"
          value={formData.schoolName}
          onChange={handleChange}
          required="true"
        />
        <Input
          name="schoolEmailAddress"
          type="email"
          placeholder="School email address"
          onChange={handleChange}
          value={formData.schoolEmailAddress}
          required="true"
        />

        <div>
          <h5 className="text-xl mb-4 text-white">School Address</h5>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Input
                name="schoolAddress.number"
                type="tel"
                placeholder="Street Number"
                onChange={handleNestedInputChange}
                value={formData.schoolAddress.number}
              />
            </div>

            <div>
              <Input
                name="schoolAddress.street"
                type="text"
                onChange={handleNestedInputChange}
                value={formData.schoolAddress.street}
                placeholder="Street Name"
                required="true"
              />
            </div>
            <div>
              <Input
                onChange={handleNestedInputChange}
                value={formData.schoolAddress.city}
                name="schoolAddress.city"
                type="text"
                placeholder="City"
                required="true"
              />
            </div>
            <div>
              <Input
                name="schoolAddress.state"
                placeholder="State"
                type="text"
                onChange={handleNestedInputChange}
                value={formData.schoolAddress.state}
                required="true"
              />
            </div>
            <div>
              <Input
                name="schoolAddress.postalCode"
                placeholder="Postal code"
                onChange={handleNestedInputChange}
                value={formData.schoolAddress.postalCode}
                type="tel"
                required="true"
                min={0}
              />
            </div>
            <div>
              <Input
                name="schoolAddress.country"
                placeholder="Country"
                type="text"
                onChange={handleNestedInputChange}
                value={formData.schoolAddress.country}
                required="true"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SchoolDetails;
